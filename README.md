## TodoMVC jquery annotations

### TODO:
* back end
* front end input
* front end rendering

### DONE:
* Comments on destroy
* Comments on create
* indexFromEl
* bindEvents
* toggle all 
* render
* some init notes
* render footer 
* edit
* update
* toggle
* local storage
* routers (directorjs)
* uuid

### PATTERNS:
* general: get jquery event, sanitize input, set or get data, clear/focus/blur if needed, render
* bindEvents: define areas with user events. add event handlers with areas then tag them with ids
* template: grab the HTML template, load it into handlebars, pass data structure into the handlebars template (via renders), HTML gets the data from the objects
* create: get event, sanitize data, set values in data structure, clear input, render
* render: render template, toggling, render other template, focus, local storage
* renderFooter: it throws data for handlebars to act on the html
* linking up the data: uuid, set values in data structure, use templating to invoke records in the html
* jquery capsules everything, App.init before the end of the capsule
* utilities: have a separate utilities library for uuid, pluralize, localstorage
* render includes a getfilteredtodo gets the URL / router status then invokes the subsequent code
