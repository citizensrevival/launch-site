# Change the layout of managing content to provide a easy-to-use cohesive experience for the user
This new layout will combine elements of Assets, Pages, Blocks, and Menus into a single editor where the user can add and edit content in-place and see their changes in real-time without having to navigate to multiple pages and edit multiple tables to compose content.


## Layout (Cohesive Page Editor)
- Menu editing will be built into the existing left navigation of the admin portal (see more details under Menu below)

#### Top Bar
- Shows the current page name, slug, and version number
- Toolbar with editing items including:
  - Page Version Selector
  - Undo
  - Redo
  - Delete Page
  - Save Version
  - Create Copy
  - Publish
  - Upload Asset
  - Create new block
  - Preview Page

#### Right Panel

Context sensative details of current edit operations
- If the user is clicks on a content block, the panel opens and shows details for the selected block
  - Block Version Selector
  - Layout
  - Layout specific attributes

- If the user is clicks on an asset, the panel opens and shows details for the selected asset (in relation to the block)
  - Asset Version Selector
  - Asset specific attributes
  - Asset variants (selectable for the current block edit)
  - Editing capabilities

Also provides a library of content blocks and assets that can be drag-n-drop into the page or blocks

#### Bottom Bar
Shows the meta-data details of the currently selected object being edited
- If no blocks are selected (being edited), then shows page meta data such as id, slug, dates, version, etc
- If a block is being edited, then shows block meta data
- If an asset is being edited, then shows asset meta data

#### Middle (Content Editor)
This is where users can add, edit, remove, and reorder content blocks while editing the content blocks in-place.
- Users should be able to drag-and-drop content blocks into the page contents
- Users should be able to drag-and-drop assets into content blocks

## Menu and Auxillary Pages
We want the user to see menu's and items represented closely to the final site map they are editing

We can add an additional component to the existing portal navigation, under the Content section, to provide this functionality.

- The menus will be represented as outlines
- We will use icon buttons for editing operations such as:
   - Adding menus and menu items
   - Editing menus ad menu items
   - Drag-and-drop handles to reorder menu items or move items between menus or creating multi-level menu items
- The main icon of each item in the outline will delineate the type of menu or menu item
    - Top-level menu
    - Internal Page navigation
    - External Page navigation
- Clicking on an internal menu item will navigate to the new Cohesive Page Editor to edit that page
- Clicking on on external menu item will open the external link in a new tab
 
 ### Auxillary Pages
 Another component in the existing portal navigation, under the Content section, will list auxillary pages that do not appear in menus
 - Clicking the heading of this coponent will navigate to a list of all pages in the main content section of the admin portal
 - Clicking on a page will navigate to the new Cohesive Page Editor
 - We will need icon buttons to add pages
 - We will need to be able to search/filter pages
 - Users can drag-and-drop these pages into menus

## Notes
- Publishing a page, automatically publishes all items on that page if the item has no current version published
- If the user tries to edit a published asset or published block, the user should be informed of all other pages that will reflect the changes when the updated block is published along with the page.
- Menus versions are automatically created and published as needed; only showing published pages
- Editing content blocks in-place means that the content block looks like it would when rendered; we need to style the input boxes without borders, with the final text styling, etc to appear as if it is rendered. This gives the user a better understanding of what the content will actually look like
- 