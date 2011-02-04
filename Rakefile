namespace :doc do 
  rule ".html" => [
    proc{|name| name.sub(/\.html\Z/, '.haml').sub(/^doc\//, 'doc-src/')}
  ] do |t|
    puts " generate #{t.name}"
    require 'haml/util'
    require 'haml/engine'
    template = File::read(t.source)
    engine = Haml::Engine.new(template)
    File::open(t.name, "w") do |f|
      f.write(engine.render)
    end
  end

  rule ".css" => [
    proc{|name| name.sub(/.css\Z/, '.sass').sub(/^doc\//, 'doc-src/')}
  ] do |t|
    puts " generate #{t.name}"
    require 'haml/util'
    require 'sass/engine'
    template = File::read(t.source)
    engine = Sass::Engine.new(template)
    File::open(t.name, "w") do |f|
      f.write(engine.render)
    end
  end

  docfiles = Rake::FileList['doc-src/**/*.haml', 'doc-src/**/*.sass']
  
  docfiles.sub!(
    /\Adoc-src\/(.*)\.haml\Z/, 
    'doc/\1.html'
  ).sub!(
    /\Adoc-src\/(.*)\.sass\Z/,
    'doc/\1.css'
  )

  desc "Generates all HTML docco based on HAML"
  task :generate

  docfiles.each do |path|
    dir = File::dirname(path)
    directory dir
    task :generate => [dir, path]
  end
end

