## Research Results

**TLDR**: Using DNDKit, I built a functioning demo of our basic use case. I believe that we can build everything we need with this framework, and I have a good idea now on how to do it. If the team agrees, we should proceed with ticketing out the next steps.

## Overview

* I implemented a basic LayoutManager demo with the following behaviors
  * Sections, Rows, Columns, and Fields
  * Everything is draggable/droppable except Columns
    * There is nothing fundamentally stopping us from making columns movable as well, but I wanted to keep things simple, and I'm not sure they should be draggable in the first place
  * Capability to add or remove rows, columns, and fields
    * Section is totally possible too, just did not get to it

## How it Works
* The `LayoutManager` component is a list of `Section` components. It resides within its own DndContext and SortableContext, with its own basic `onDragEnd` handler, to keep things simple.
  * A `DndContext` is needed above any draggable code. They can be nested.
  * A `SortableContext` is an abstraction of `DndContext` which makes it simpler to work with sortable lists of items, which fits all of our use cases, so I leveraged that system heavily here.
  * `onDragEnd` is the callback that determines what to do with a draggable item when it is dropped somewhere. Typically it means updating the react state such that the index of the draggable reflects where you dropped it.
* The `Section` component is a list of `Row` components.
  * It has the most complicated react state of the entire application because it manages most of the applications state.
  * The location of all rows, columns, and items is stored here, as well as the more complex callbacks. I tried composing the state into smaller pieces (see earlier commits), but the problem is that the `onDrag*` handlers for a `Section` need to know about all of the draggable and droppable items when determining where and how to drop a draggable (and to do it smoothly).
  * Because I placed the core dragging logic here, it means that fields are not currently draggable to other sections in this PoC. If we wanted that behavior, it would require moving the core logic up to the `LayoutManager`, and managing both the `Section` state and the other object states in the same place. The other benefit to doing that is that will make exporting the full layout schema simpler, since the state is all in one place.
* A `Row` component is a list of `Column` components, in horizontal layout.
* A `Column` component is a list of `Item` components (in our world they should be called `Field`), in vertical layout
* Each of these objects have unique identifiers used to track where things go. There are helpers in `helpers.ts` to work with these.
* I also define a collision detection strategy in `collisionDetectionStrategies.ts`. This exports the functions that determine when two objects have "collided", prompting draggable animations.

## My Suggestions for the Next Steps

* We should use DndKit. It did everything I wanted it to do and more. Although the documentation is limited for advanced use cases like our own, they have numerous storybook examples we can read for direction.
* I think we should probably hoist the core layout logic up to the `LayoutManager` component so that we can move fields between sections. It will require updating the `onDrag*` handlers to account for this, but it should be an extension of the same algorithms written in this POC. Currently, they check to see if they need to move the field to another index in the same column, another column in the same row, or another column in a different row. We would just need to add logic for handling another column in a different section.
* Furthermore, I wonder if the logic should be hoisted *above* LayoutManager, so that we give the caller control over the state. This might be valuable, since they will need to pass in a layout in edit scenarios.
  * I also think we need to find better ways to compose the core layout logic. In this POC, I threw it all into one hook. It does the job but it's dirty. Perhaps we should separate these into multiple hooks, perhaps we should use a react context. 
* I am tempted to build the LayoutManager as a generic `MosaicFormBuilder` component in Apex, so that we could theoretically host it in its own repository and npm package at some point, so that future simpleview projects do not have to reinvent the wheel here. This is already the second or third time (if not more) that Simpleview is building something like this. It also feels like it would help keep the LayoutManager code simpler and segregated from Apex, which would be a win because of the complexity it already has in this PoC. On the other hand, we can't predict if future projects' requirements would be met by this component, so it may not be worth it.
* If we made it generic, an API like this might be preferred to give caller control of the look and field of the pieces:
```ts
<LayoutManager
  ...
  fieldComponent={CustomFieldComponent}
  columnComponent={CustomColumnComponent}
  rowComponent={CustomRowComponent}
  sectionComponent={CustomSectionComponent}
/>
```
* Finally, we need to decide what the UI should actually look like, as I did not prioritize UX at all in this POC.
  * How should rows and sections be shifted around? Currently, they can be quite tall (particularly sections), so while I made them draggable, it's awkward, because you cannot drag it more than one index away, since only two sections usually show at once on screen.
  * How should objects be deleted? I used a delete button for each object, which has its benefits. But there are other options, like dropping the object into a "trash" bin area.
  * How should objects be added? I used + buttons for this, which seems to work well.
  * Should columns be draggable?
  * etc.



