# C++ Map: Accessing an Element
## Or, Layers on Layers on Layers

This post isn't meant to be a put down of C++ (I'm far too green with C++ to
justify doing something like that).
Part of what makes languages so fun to learn are the small ways
they get you to rethink how to conceptualise or implement a concept. This post
provides an example in a place I didn't expect to find one.

## The Problem

From [exercism.io's 'nucleotide-count' problem](https://exercism.io/tracks/cpp/exercises/nucleotide-count)
> Given a string of DNA (ie containing only the characters `ACGT`) count the
frequencies of each 'nucleotide' (a character in the string).

Our interface looks like this:
```c++
class DnaCounter
{
    std::map<char, int> ntc;
public:
    DnaCounter(std::string nt);
    int count(char c) const;
    std::map<char, int> nucleotide_counts() const;
}
```
We populate the map of nucleotide frequencies `ntc` when an object is
initialised, and just implement interfaces for retrieving values from the map.
The `count` function returns the frequency for a given nucleotide, and
`nucleotide_counts` returns all frequencies as a map.

Notice the `const` declaration after the methods. Coming from C,
this was a bit non-intuitive, but there are some more uses for `const` in C++.
(There's a good overview [here](http://duramecho.com/ComputerInformation/WhyHowCppConst.html)).
In our case, it's necessary because we want to tell the C++ compiler that we
aren't going to make changes to member variables. The tests that exercism
provides with this problem won't compile unless this declaration is made, and
it's relevant to discovering the nature of C++'s map.

Finally, we get around to implementing methods. My initial implementation
looked something like this:
{% raw %}
```c++
DnaCounter::DnaCounter(string dna_string)
{
    ntc = {{'A', 0}, {'C', 0}, {'G', 0}, {'T', 0}};
    for (char c : dna_string)
    {
        ntc[c]++;
    }
}

map<char, int> DnaCounter::nucleotide_counts() const
{
    return ntc;
}

int DnaCounter::count(char c) const
{
    return ntc[c];
}
```
{% endraw %}
We don't check for malformed DNA strings yet, so this should fail at least some
of the tests provided, but there's a bigger problem with the above code: it
doesn't compile.

```c++
nucleotide_count.cpp: In member function ‘int DnaCounter::count(char) const’:
nucleotide_count.cpp:16:17: error: passing ‘const std::map<char, int>’ as ‘this’ argument discards qualifiers [-fpermissive]
   16 |     return ntc[c];
      |                 ^
```

You'll recall that we declared the method as being const, promising not to
change any member variables. All we're doing is accessing an element of the
map, so why would the compiler complain that we're violating this promise?

Our constructor provides the last clue we need to pinpoint the problem. When
given a key not currently in the map, it doesn't throw any errors, despite (in
theory) performing addition with an object that doesn't exist. In fact, it
works as if the value of any new key was already initialised to 0:
{% raw %}
```c++
void main()
{
    const DnaCounter c = DnaCounter("BAR");
    map<char, int> m = c.nucleotide_counts();
    // m = {{'A': 1}, {'B': 1}, {'C': 0}, {'G': 0}, {'R': 1}, {'T': 0}}
}
```
{% endraw %}
At this point, there's not much left to do but RTFM.

## The C++ map Class
### map::operator[]

For some key k, if k exists the \[\] operator returns a reference to the value at
that key.

If k does not exist, then a new value is inserted and intialised at k. This is
why our code breaks, and why our seemingly undefined ints have values of 0.

So, how can we ensure our program does not attempt to change the map when we
access an element?

### map::count?

Perhaps we could ensure that the value exists before attempting to access it?
`map::count` allows us to check for the existence of a key-value pair in the
map, but there's some problems with this method.

First, it's kind of clumsy: we need to access the map at the given key twice,
rather than just once and discarding non-existant pairs.

Additionally, the error we've run into due to const qualifying our method was a
compiler issue: we still can't access the map in a way that is defined as being
able to alter a member variable.

### map::find and map::at

One solution is afforded us in the form of `map::find`. This method returns an
iterator to the position of the desired value, and if it's not found, it
returns an iterator to `map::end`. We could implement `DnaCounter::count` as
follows:
```c++
int DnaCounter::count(char c) const
{
    auto it = ntc.find(c);
    if (it != ntc.end())
    {
        return it->second;
    }
    else
    {
        throw invalid_argument("Argument must be a valid DNA nucleotide.");
    }
}
```
A second option is `map::at`, which returns a reference to the value if found,
and throws an exception if not:
```c++
int DnaCounter::count(char c) const
{
    try
    {
        return ntc.at(c);
    }
    catch (out_of_range &e)
    {
        throw invalid_argument("Argument must be a valid DNA nucleotide.");
    }
}
```

If this were, say, Python, `map::at` would always be the preferred method
of access ('Ask Forgiveness, Not Permission'). The C++ world would generally
rather you not use exception handling for regular program flow though.
{# TODO how does speed compare between at and find? #}

Additionally, `map::at` was only introduced to the class with C++11, so if you
need to support pre-C++11...you probably have no need for this advice in the
first place, honestly, but you can't use `map::at`.

Which is the better for our case? Since a DNA nucleotide must always be one of
A, C, G or T (all other cases are invalid by definition), I decided to
implement `count` and the constructor using `map::at`. YMMV.

## Why?

I suppose the fact that the behaviour of the default access operator took me
by suprise is worth considering. Having come from other languages that
implement dictionaries in the standard library or builtins, why is this the
first time I have encountered this behaviour? Why would the most basic way of
accessing elements in a map be implemented like this in C++?

My best guess is that it has something to do with assigning values to new keys,
and the fact that C++ keeps it simple.

Inserting and returning a reference to a new element allows for insertion
syntax like `m[k] = v`, without needing to consider how the programmer is
going to use the mapped value (access or assignment). To do that, you would
need to define the relationship between `operator[]` and `operator=`, or have
`operator[]` return a type that overloads non-assignment operators to throw an
exception if the object is empty (quite similar to how some other languages
handle access to maps/dictionaries).

Such a solution still wouldn't be able to be used in const qualified methods
however, so its usage would not be so useful for our use case. And when you say
it like that, a few puzzle pieces might click into place and it becomes
more obvious that Stroustrup et al. knew what they were doing. ;)
