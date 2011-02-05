rule ".html" => [
    proc{|name| name.sub(/\.html\Z/, '.haml').sub(/\Adoc\//, 'doc-src/')}
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
    proc{|name| name.sub(/.css\Z/, '.sass').
      sub(/\Adoc\//, 'doc-src/').
      sub(/\Acss\//, 'sass/')
  }
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

namespace :stylesheets do
  stylefiles = Rake::FileList['sass/**/*.sass']
  stylefiles.sub!(
    %r{\Asass/(.*)\.sass\Z},
    'css/\1.css'
  )
  
  desc "Generates the CSS for use with NinjaScript"
  task :generate

  stylefiles.each do |path|
    dir = File::dirname(path)
    directory dir
    task :generate => [dir, path]
  end
end

namespace :doc do 
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


desc "Generate all static content from source files"
task :default => ["doc:generate", "stylesheets:generate"]
