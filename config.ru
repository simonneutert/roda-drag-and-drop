# frozen_string_literal: true

require 'json'
require 'roda'

# This is a simple Roda application that serves an HTML page for drag-and-drop file upload.
class App < Roda
  plugin :render, escape: true
  plugin :public, root: 'public', gzip: true
  plugin :json

  route do |r|
    r.public

    # GET / request
    r.root do
      # Serve the HTML page for drag-and-drop file upload
      view :index
    end

    # /upload branch
    r.on 'upload' do
      # Set variable for all routes in /upload branch
      @greeting = 'Hello'

      # /hello request
      r.is do
        # GET /hello request
        r.get do
          "#{@greeting}! This was a success!"
        end

        # POST /hello request
        r.post do
          # in case you want to do something with the uploaded files, you can access them here
          files = Array(r.params['files']).map { |file| { filename: file[:filename], tempfile: file[:tempfile] } } # rubocop:disable Lint/UselessAssignment
          response['Content-Type'] = 'application/json'
          { redirect: '/upload' }
        end
      end
    end
  end
end

run App.freeze.app
