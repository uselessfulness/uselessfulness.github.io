# Simple C Obfuscation

## Introduction

Recently I've taken an interest in the magnificent and marvelously mystifying
wonders of the [International Obfuscated C Code Contest](https://ioccc.org).

One entry, anderson 2000, caught my eye. The hint file mentions that hand
deobfuscation is the best way to understand how the program, and the program
seemed simple enough in function that I might be able to do it, so I did.

This post will detail some techniques you can use to make C programs harder to
understand, as learnt from anderson.c.

To help demonstrate, here is a sample program for your viewing pleasure:

```c
#include <stdio.h>
#include <stdlib.h>
#include <limits.h>

unsigned char sum(unsigned char a, unsigned char b)
{
    if (UCHAR_MAX - a < b)
    {
        return 0;
    }
    else
    {
        return a + b;
    }
}

int main(int argc, char *argv[])
{
    if (argc < 3) { return 1; }
    unsigned char a = strtoul(argv[1], NULL, 10);
    unsigned char b = strtoul(argv[2], NULL, 10);
    printf("Sum: %i\n", sum(a, b));
}
```

The program is simple enough. We take 2 unsigned chars as
arguments and print their sum. If their sum would overflow, we print
their sum as 0. The only reason these are chars rather than, say, ints, is
only so it's easier to hit the max. Let's make it ugly.

## Globals

Mutable globals are bad practice for a reason. It's trivial to make spaghetti code
where variables change inside a function, changing the environment of the
caller without any outside indication. Better yet, if these globals are used
within other functions, a spaghetti spiderweb is quickly woven
across your program.

Since we're obfuscating our code, none of our variable names have
any indication of how they should be used. So why should we only use them for
one thing? When we're finished using `char a` in `void t()` as a temporary
variable to swap characters, why not use it in `void p()` to index an
array, or to hold a bitmask? Combine this with other variables' state being very
important in later functions to ensure your reader cannot simply write off
changes across functions.

Anderson's entry also takes the approach of having every variable be not just
global, but a char or pointer to/array of chars, which is merely incidental in
our program. This means that any context the reader may have gleaned from the
type is also removed.

### Example 1

```c
#include <stdio.h>
#include <stdlib.h>

unsigned char a[2], c; char **x;

void f(void)
{
    // C still has 255 from decrementing in n() - we can use that here!
    if (c - *a < *(a+1))
    {
        ++c;
    }
    else
    {
        c = *a + *(a+1);
    }
}

void g(void)
{
    printf("Sum: %i\n", c);
}

void p(void)
{
    // Split into own function to make logic less obvious in main()
    a[c] = strtoul(x[c+1], NULL, 10);
}

void n(void)
{
    while (c--) { p(); };
}

int main(int b, char *m[])
{
    if (b < 3) { return 1; }
    x = m;
    c = 2;

    n(); f(); g();
}
```

This is better, but still readable. While it is difficult to figure out
the function of the entire program from any specific function, its still not
hard to grok the functions and how they interact with each other. `f()` is
especially readable - its function is pretty obvious, and it tells a reader a lot
about how the variables are used.

## Short-Circuit Evaluation

C evaluates logical operators from left to right. For some operators, it can
discern
what the result will be without having to evaluate all the expressions that
operator's output depends on. For example, C knows that `0 && x()` will always be
0, no matter what the value of x is. C will 'short-circuit' the evaluation of
the operator, and leave the right hand expression alone, which has important
implications if that function has side-effects.

This allows us to save space and
decrease readability by replacing if statements with `&&` and `||`. Not
only this, but when combined with other operators to make more complex
statements, you can add a few extra seconds of latency to a reader's
understanding of the code.

### Example 2

```c
void f(void)
{
    c += c - *a < *(a+1) || (c = *a - 1 + *(a+1));
}

int main(int b, char *m[])
{
    b > 2 && (x = m), (c = 2), n(), f(), g();
}
```

One downside to using this approach is that these operators cannot involve
functions that return void, though as we'll see this can be worked
around and even used to our advantage.

## Implicit Return

In C, you can write a function returning a value without writing any return
expressions in its implementation. Using the return value is
undefined behaviour, but for our purposes we don't particularly care - we
just want to tell the compiler our function can be used in expressions where it
expects a return value. We don't want to use this value purposefully (it's
undefined behaviour to do so) but it fits nicely into the short-circuit
evaluation discussed above.

Additionally, although warnings will be given in C99+, if we give no return
type then it will infer it to return int, so we give our reader even less
information. You could also give any other return type, for the purposes of
misleading your reader.

```c
f(void)
{
    c += c - *a < *(a+1) || (c = *a - 1 + *(a+1));
}

g(void)
{
    printf("Sum: %i\n", c);
}

p(void)
{
    a[c] = strtoul(x[c+1], NULL, 10);
}

n(void)
{
    c-- && (p(), n());
}

int main(int b, char *m[])
{
    b > 2 && (x = m), (c = 2), n(), f(), g();
}
```

Our program is starting to look evil now. One painful point is the need to
seperate functions so much in our logical statements, as our reader gets a clear
view of the order of execution. We will now strive to bring them together in a
terrible way.

## K&R-Style Initialiser Lists

Function declarations in C suffer from 2 problems: implicit return types, as
explored above, and old-school initialiser lists. The meaning of initialiser
lists has evolved with C++, but in C they allow us to eject the input of the
function, and initialise them after the function declaration itself. However,
if one wishes to be evil, we can simply initialise nothing, and without
explicitly declaring the function as taking void, give both the reader and the
compiler no information whatsover about how the function should be used.

Since the compiler does not know if the function has variables it would like to
assign from input, we can give the function input at the call site. Where the
function is called, the expression within the brackets is evaluated before the
function, leading to a fun reading effect where reading the expression from
left to right is very misleading - see our main function below.

### Example 4

```c
f()
{
    c += c - *a < *(a+1) || (c = *a - 1 + *(a+1));
}

g()
{
    printf("Sum: %i\n", c);
}

p()
{
    a[c] = strtoul(x[c+1], NULL, 10);
}

n()
{
    c-- && n(p());
}

int main(int b, char *m[])
{
    b > 2 && f(n(x = m), c = 2), g();
}
```

## Wrong-side Indexing

In C, the expression `a[b]`, where `a` is an array or pointer type and `b` is an
index, is essentially syntactic sugar for `*(a+b)`. This is true to the extent
that `a[b] == b[a]`, which reads completely nonsensensically when considered
semantically (you can't index an index with an array).

### Example 5

```c
f()
{
    c += c - *a < (*x++[0] = 1)[a] || (c = *a - 1 + *(a+1));
}

p()
{
    c[a] = strtoul(*(1+c+x), NULL, 10);
}
```

### Result

```c
#include <stdio.h>
#include <stdlib.h>

unsigned char a[2], c; char **x;

f()
{
    c += c - *a < (*x++[0] = 1)[a] || (c = *a - 1 + *(a+1));
}

g()
{
    printf("Sum: %i\n", c);
}

p()
{
    c[a] = strtoul(*(1+c+x), NULL, 10);
}

n()
{
    c-- && n(p());
}

int main(int b, char *m[])
{
    b > 2 && f(n(x = m), c = 2), g();
}
```

## Interlude: ASCII Art

Let's take this time to make our program look pretty (pretty unreadable, heh).
I don't know how the pros tend to do this, but I like to split my
program into roughly equal blocks, which you can generally increase and
decrease in length by adding spaces and semicolons where appropriate.

Here I've made the program into a cross, because it's easy and "cleverly"
constrasts the program's function, which is to sum.

### Final Program

```c
#include <stdio.h>
#include <stdlib.h>


unsigned                   char a[2]
  ,c; char               **x;f(){c
    +=c-*a<(           *x++[0]=1
      )[a]||(c       =*a-1+*(a
        +1));}g(   ){printf(
         "Sum: %i\n",c);}p
         (){c[a] = strtoul
        (*(1+c+x   ),NULL,10
      );}n(){c       --&&n(p()
    );}; int           main( int
  b,char*m               []){b>2&&
f(n(x=m),                  c=2),g();}
```

## How could it be worse?

The anderson.c file follows some good style: each function in the code performs
some specific task, and the hierarchy of function calls is understandable.
There is no reason that this should necessarily be the case, however >:)

We also do not discuss macro obfuscation, which is found in a large set of
programs that bless the IOCCC. It should be clear that a large number of such
techniques are useless once the preprocessor is applied to the source, but
clever combinations of macros leads to some very non-intuitive behaviour.

Finally, there is no reason to use something as neat as a set of variables to
hold program state, especially if we are using chars. A large array of values
without clear use, differentiated by offsets and lengths that often overlap
each other and are modified within other parts of the program, is particularly
devious.

I hope that this exploration into C's interesting perspective on syntax and
semantics has been enjoyable and, somehow, useful for you. Alongside anderson,
some key standout entries that I have enjoyed a lot come from endoh and yang,
well worth a search on the [leeterboard](https://www.ioccc.org/years.html).
