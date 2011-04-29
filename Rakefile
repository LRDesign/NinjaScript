ASSET_ROOT = 'generated'
VERSION = '0.9'

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
    %r{\Asrc/sass/(.*)\.sass\Z},
    "#{ASSET_ROOT}/css/\1.css"
  )
  
  desc "Generates the CSS for use with NinjaScript"
  task :generate

  stylefiles.each do |path|
    dir = File::dirname(path)
    directory dir
    task :generate => [dir, path]
  end
end

namespace :build do

  dir "generated"

  desc "Build Ninjascript & assets"
  task :project => %w{stylesheets:generate generated} do
    require 'sprockets'

    sec = Sprockets::Secretary.new(
      :root => '.',
      :asset_root => ASSET_ROOT,
      :load_path => %w[src/javascript vendor],
      :source_files => %w[src/javascript/main.js]
    )
    sec.concatenation.save_to("#{ASSET_ROOT}/ninjascript.js")
    sec.install_assets
  end

  require 'rake/packagetask'
  Rake::PackageTask.new('ninjascript', '0.9') do |t|
    t.need_zip = true
    t.need_tar_bz2 = true
    t.need_tar_gz = true
    t.package_files.include("#{ASSET_ROOT}/**/*")  
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

  desc "Serves as a reminder to write the task"
  task :pdoc
end


desc "Generate all static content from source files"
task :default => ["doc:generate", "stylesheets:generate"]
