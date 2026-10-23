# Roda drag-and-drop demo

A small Ruby [Roda](https://roda.jeremyevans.net/) app demonstrating file and folder selection, drag-and-drop, and an upload queue. The browser behavior is based on [MDN's File drag and drop guide](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/File_drag_and_drop).

## Run it

You need Ruby and Bundler installed. From the project directory, run:

```sh
bundle install
bundle exec rackup
```

Open [http://localhost:9292](http://localhost:9292) in your browser.

This is a demo: the upload route accepts the files but does not save them.
