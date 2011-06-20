ASSET_ROOT = 'generated'

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
      sub(%r{\Adoc/}, 'doc-src/').
      sub(%r{\Asrc/assets/css/}, 'src/sass/')
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
  stylefiles = Rake::FileList['src/sass/**/*.sass']
  stylefiles.sub!(
    %r{\Asrc/sass/(.*)\.sass\Z},
    "src/assets/css/\\1.css"
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

  directory "generated/javascript"
  directory "auto-constants"

  task :constants => %w{auto-constants} do
    require 'yaml'

    File::open("auto-constants/constants.yml", "w") do |file|
      file.write(YAML::dump({
        "BUILD_DATE" => Time.new.strftime("%m-%d-%Y"),
        "COPYRIGHT_YEAR" => Time.new.strftime("%Y")
      }))
    end
  end

  desc "Build Ninjascript & assets"
  task :project => %w{stylesheets:generate generated/javascript constants} do
    require 'sprockets'

    sec = Sprockets::Secretary.new(
      :root => '.',
      :asset_root => ASSET_ROOT,
      :load_path => %w[src/javascript vendor auto-constants],
      :source_files => %w[src/javascript/main.js]
    )

    puts "Saving concatentated javascript"
    sec.concatenation.save_to("#{ASSET_ROOT}/javascript/ninjascript.js")
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
end


desc "Generate all static content from source files"
task :default => ["doc:generate", "stylesheets:generate"]
