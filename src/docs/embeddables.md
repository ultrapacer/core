##### Embed the Aid Station Table on Your Website
Add in the following code:
```html
    <html>
      <head>
        ...
        <script src="https://cdn.jsdelivr.net/npm/vue@2.6.13"></script>
        <script src="https://ultrapacer.com/public/components/js/up-table.min.js"></script>
        ...
      </head>

      <body>
        ...
        <up-table course-id="5dc742995f5b9b0007339dfd" />
        ...
      </body>
    </html>
```
Replace the course-id with your own, and voila! You get it rendered on your
page.

See the [Example Here](/public/components/up-table-demo.html)

Addional options include:
```html
    <up-table
      course-id=...
      style=...
      units=...
      columns=...
    />
```
*course-id* is required. This is the unique code or race name from the URL:\
https:\//ultrapacer.com/course/**course-id** or
https:\//ultrapacer.com/race/**course-id**

*style* is standard html styling. For example, limit the height and width
of the table:
```html
    style="max-width: 400px; max-height:600px; overflow: scroll"
```

*units* can be either "english" or "metric":
```html
    units="english"    or    units="metric"
```

*columns* is a comma separated list of field names in the order they should
appear, with the following options:
  - name (aid station name)
  - location (total distance)
  - elevation (elevation at waypoint)
  - distance (incremental distance)
  - gain (gain from prior waypoint)
  - loss (loss from prior waypoint)
```html
    fields="location,name,distance"
```
