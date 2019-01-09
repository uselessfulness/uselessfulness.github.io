// Just a string for now, since we're static and can't really 'load' the json from anywhere
// TODO make user section
var store_items_json = '{"items": [' +
    '{"name": "First Item", "price": 4.99, "image": "../assets/150x150.png", "image_large": "../assets/250x250.png", "description": "Description of first item", "customisable": true, "stock": 50, "type": "music", "new": true},' +
    '{"name": "Second Item", "price": 4.99, "image": "../assets/150x150.png", "image_large": "../assets/250x250.png", "description": "Description of second item", "customisable": true, "stock": 50, "type": "music", "new": true},' +
    '{"name": "Third Item", "price": 4.99, "image": "../assets/150x150.png", "image_large": "../assets/250x250.png", "description": "Description of third item", "customisable": true, "stock": 50, "type": "merch", "new": false},' +
    '{"name": "Fourth Item", "price": 4.99, "image": "../assets/150x150.png", "image_large": "../assets/250x250.png", "description": "Description of fourth item", "customisable": true, "stock": 50, "type": "merch", "new": true},' +
    '{"name": "Fifth Item", "price": 4.99, "image": "../assets/150x150.png", "image_large": "../assets/250x250.png", "description": "Description of fifth item", "customisable": true, "stock": 50, "type": "music", "new": false},' +
    '{"name": "Sixth Item", "price": 4.99, "image": "../assets/150x150.png", "image_large": "../assets/250x250.png", "description": "Description of sixth item", "customisable": true, "stock": 50, "type": "music", "new": false},' +
    '{"name": "Seventh Item", "price": 4.99, "image": "../assets/150x150.png", "image_large": "../assets/250x250.png", "description": "Description of seventh item", "customisable": true, "stock": 50, "type": "music", "new": false},' +
    '{"name": "Eigth Item", "price": 4.99, "image": "../assets/150x150.png", "image_large": "../assets/250x250.png", "description": "Description of eigth item", "customisable": true, "stock": 50, "type": "music", "new": true},' +
    '{"name": "Ninth Item", "price": 4.99, "image": "../assets/150x150.png", "image_large": "../assets/250x250.png", "description": "Description of ninth item", "customisable": true, "stock": 50, "type": "merch", "new": true},' +
    '{"name": "Tenth Item", "price": 4.99, "image": "../assets/150x150.png", "image_large": "../assets/250x250.png", "description": "Description of tenth item", "customisable": true, "stock": 50, "type": "merch", "new": false}' +
    ']}';

var store_data;

// First loaded items should all be new
current_type = "new";

// Lets us check if there's a pesky enlarged item hanging around
enlarged = false;

// Pass function to jQ to succinctly load after DOM
$(function main() {
    // Parse JSON
    store_data = JSON.parse(store_items_json);

    // Create box elements for each item
    for (i = 0; i < store_data.items.length; i++) {
        var item = store_data.items[i];
        var $el = $('<li></li>')
            .hide()
            .attr({'id': i + '-litag'})
            .click(function() {
                // If clicked, make large if not already
                if ($(this).width() == 280)
                    // Slice away '-litag' from id and use result in click
                    // The ID is needed as the click function will be executed *after* the for loop ends, so the context will be different
                    // This means if we used item or i, they would be the most recent value of that variable
                    enlarge(this.id.slice(0, -6));
            })
            .append(
                $('<a></a>')
                    .attr({'href': '#'})
                    .addClass('store-item')
                    .append(
                        $('<img/>')
                            .attr({'src': item.image})
                    )
                    .append(
                        $('<p></p>')
                            .text(item.name)
                    )
                    .append(
                        $('<p></p>')
                            .addClass('item-price')
                            .text(item.price)
                    )
                    .append(
                        $('<p></p>')
                            .text('View Details Button')
                    )
            );
        store_data.items[i].$element = $el;
        $el.appendTo($('.store-wrapper'));
        if (item.new)
            $el.show();
    }

    // Add click events to store nav buttons
    $('.store-nav ul li').each(function() {
        $(this).click(function() {
            // Slice away '-button' from id and use result as type
            filter(this.id.slice(0, -7));
        });
    });
});

// from https://stackoverflow.com/questions/951021/what-is-the-javascript-version-of-sleep
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Filters the items in the store
async function filter(type) {
    // If the items of desired type are already loaded, don't bother. Otherwise, change the type for the future
    if (enlarged)
        close_enlarged_item();
    else if (type == current_type)
        return;
    else if (current_type == 'checkout')
        close_checkout();

    await fade_all_store_items();

    if (type == 'checkout')
        checkout();

    current_type = type;

    store_data.items.forEach((item) => {
        if ((type == "new" && item.new) || type == item.type)
            item.$element.fadeIn(200);
    });
}

async function fade_all_store_items() {
    $('.store-item').each(function () {
        $(this).parent().fadeOut(200);
    });

    // fadeOut is async, so wait for elements to hide before continuing
    await sleep(200);
}

async function enlarge(item_index) {
    const item = store_data.items[item_index];
    await fade_all_store_items();
    enlarged = true;
    $('.store-wrapper').append(
        $('<section></section>')
            .addClass('store-item-enlarged')
            .append(
                $('<img/>')
                    .attr({'src': item.image_large})
            )
            .append(
                $('<div></div>')
                    .append(
                        $('<h2></h2>')
                            .text(item.name)
                    )
                    .append(
                        $('<p></p>')
                            .text(item.description)
                    )
                    .append(
                        $('<p></p>')
                            .addClass('item-price')
                            .text(item.price)
                    )
                    .append(
                        $('<a></a>')
                            .attr({'href': '#'})
                            .text('Add To Checkout Button')
                            .click(function () {
                                // In this case we can be sure that item_index is the same, since it is assigned just before this event becomes available
                                localStorage.setItem(item_index + 'quantity', '1');
                            })
                    )
            )
    );
}

function close_enlarged_item() {
    // Callback to remove so that we can be sure item is finished fading out first
    $('.store-item-enlarged').fadeOut(200, function () {
        this.remove();
    });
}

function checkout() {

    var $checkout = $('<section></section>').addClass('checkout-container');
    $checkout.appendTo($('.store-wrapper'));

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
    // Basically, makes a copy of localStorage, but only expands the keys we've set
    const stored_items = {...localStorage};

    // Object.entries is also new to ECMA2017+, succinct kv pair iteration
    for (const [key, quantity] of Object.entries(stored_items))
    {
        // slice away quantity from key and let js' disgusting weak typing do the rest
        var item = store_data.items[key.slice(0, -8)];
        $checkout.append(
            $('<div></div>')
                .addClass('checkout-product')
                .append(
                    $('<img/>')
                        .attr({'src': item.image})
                )
                .append(
                    $('<h3></h3>')
                        .text(item.name)
                )
                .append(
                    $('<input/>')
                        .attr({
                            'type': 'number',
                            'id': key + '-checkout',
                            'value': quantity,
                            'min': 0,
                            'max': item.stock
                        })
                        .change(function() {
                            localStorage.setItem(this.id.slice(0, -9), this.value);
                            update_checkout_sum();
                        })
                )
                .append(
                    $('<p></p>')
                        .addClass('item-price')
                        .text(item.price)
                )
                .append(
                    $('<button></button>')
                        .attr({'id': 'remove-' + key})
                        .text('Remove')
                        .click(function() {
                            delete localStorage[this.id.slice(7)];
                            $(this).parent().fadeOut(200, function () {
                                this.remove();
                            });
                        })
                )
        )
    }
    $checkout.append(
        $('<div></div>')
            .addClass('checkout-summary')
            .append(
                $('<p></p>')
                    .addClass('item-price')
            )
            .append(
                $('<button></button>')
                    .text('Checkout')
            )
    );

    update_checkout_sum();
}

function update_checkout_sum() {
    const stored_items = {...localStorage};

    var total_cost = 0;

    for (const [key, quantity] of Object.entries(stored_items))
    {
        var item = store_data.items[key.slice(0, -8)];
        total_cost += item.price * quantity;
    }

    $('.checkout-summary p').text(total_cost.toFixed(2));
}

function close_checkout() {
    // Callback to remove so that we can be sure item is finished fading out first
    $('.checkout-container').fadeOut(200, function () {
        this.remove();
    });
}
