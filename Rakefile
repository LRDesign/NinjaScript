namespace :doc do 
  rule ".html" => [
    proc{|name| name.sub(/\.html\Z/, '.haml').sub(/^doc\//, 'doc-src/')}
  ] do |t|
    require 'haml/util'
    require 'haml/engine'
    template = File::read(t.source)
    engine = Haml::Engine.new(template)
    File::open(t.name, "w") do |f|
      f.write(engine.render)
    end
  end

  docfiles = Rake::FileList['doc-src/**/*.haml'].sub(
    /\Adoc-src\/(.*)\.haml\Z/, 
    'doc/\1.html'
  )

  desc "Generates all HTML docco based on HAML"
  task :generate => docfiles
end

