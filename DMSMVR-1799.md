## Research Results

**TLDR**: More research needs to be done to prove we can do everything we need to do, 
but I believe I've identified a good library to continue research on, and a better approach.

## Libraries I looked into

### 1. react-grid-layout/react-grid-layout ❌
https://github.com/react-grid-layout/react-grid-layout

I created a rudimentary POC for this one testable/reviewable with commit: d2de7027905e7533690a2a4b868cec9f2036243d

This one support a draggable/droppable grid out of the box, which was very attractive, so I tried it first.

However, I hit numerous issues with this.

The problem mainly lies in the fact that the library doesn't seem to support multiple grids, nor a way to subdivide a single grid. Everytime I tried, I encountered very bizarre UI glitches. Howerver, we need a library to support multiple grids, because we will have multiple sections of a form and each one needs to accept drag-and-drop capabilities.

I also found very limited / broken support for individual grid items having children.

Also one minor annoyance: the library is mostly documented with class-based examples, and there are some additional hoops you have to run through to use functional patterns.

Read the commit message for more info.

### 2. atlassian/react-beautiful-dnd 🤔


https://github.com/atlassian/react-beautiful-dnd

I read a lot of the docs for this one, but I ultimately decided not to attempt to implement anything with it.

Reasons:
* It is in maintenance mode and won't be updated further except for critical security fixes. 
  * Doesn't mean it's bad, it might be great and doesn't need more updates, but figured I would prefer repos that respond to issues and PRs
* None of the storybook examples seemed to imply support for grids, only lists
  * This isn't necessarily a dealbreaker, because you could still have multiple horizontal lists that might cover our use case. More on that later...
* It's still potentially viable, but I decided to focus elsewhere


### 3. clauderic/dnd-kit 🤔

https://github.com/clauderic/dnd-kit

I pivoted the latest commits of this repo to try out dnd-kit.

This is a more modern library (actively developed, uses functional-patterns, provides hooks) with a lot of very good documentation.

They do not explicitly support grids as we need them, but this is also has a lot of support for low-level control.

They have a high-level sortable-list preset that I tried out.

I hacked something together in my latest commit for just a single section with dynamic rows and columns and fields, but it is glitchy.


## Next Steps

I think the next step is to continue attempting to build the POC w/ the requirements laid out in DMSMVR-1799, but with the lessons learned from this POC. 


**#1 Lesson**: I encountered a ton of complexity in attempting to allow users to arbitrarily drop fields in any coordinate space, whether or not there was a draggable element there or an adjacent element in that row.


For example, attempting to make a grid like this:

```
[ Field, Field, Field ]
[ Empty, Empty, Field ]
[ Empty, Field, Field ]
```

Was pretty difficult. It's definitely possible, especially if I dug deeper into the low-level apis for this, but I ultimately determined it **actually wasn't necessary**. Row 2 and 3 in the above example will never happen, according to this dicussion:

https://simpleview-workspace.slack.com/archives/C02STFX0WUB/p1686350512984639

Instead, we will always have fields consecutively laid out from left to right.

So we need to instead support grids like this:


```
[ Field, Field, Field ]
[ Field, Empty, Empty ]
[ Field, Field, Empty ]
```

This seems more easily attainable using multiple horizontal lists laid out in column-order:

```javascript
// pseudo-react
<Column>
  <DraggableContext>
    <HorizontalList fields={row[0]} />
    <HorizontalList fields={row[1]} />
    <HorizontalList fields={row[2]} />
  </DraggableContext>
</Column>
```

Both `dnd-kit` and `react-beautiful-dnd` appear to support multiple horizontal lists.

`dnd-kit` demos
* Horizontal List: https://master--5fc05e08a4a65d0021ae0bf2.chromatic.com/?path=/story/presets-sortable-horizontal--basic-setup
* Multiple Lists: https://master--5fc05e08a4a65d0021ae0bf2.chromatic.com/?path=/story/presets-sortable-multiple-containers--basic-setup

`react-beautiful-dnd` demo:
* Multiple Horizontal Lists: https://react-beautiful-dnd.netlify.app/?path=/story/multiple-horizontal-lists--stress-test

