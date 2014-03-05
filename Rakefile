ASSET_ROOT = 'generated'
BUILDTOOLS_DIR = "tools"
NODE_MODULES = "node_modules"

CLOSURE_JAR = File::join(BUILDTOOLS_DIR, "compiler.jar")

CLOSURE_DIR = File::join(NODE_MODULES, "closure-library/closure")
CLOSURE_DEPSWRITER = File::join(CLOSURE_DIR, "bin/build/depswriter.py")
CLOSURE_LIBRARY_DIR = File::join(CLOSURE_DIR, "goog")
CLOSURE_DOTS = File::join(*(%w{..} * CLOSURE_LIBRARY_DIR.split(File::Separator).length))
SINON_DIR = File::join(BUILDTOOLS_DIR, "sinon")

NPM_BIN = File::join(NODE_MODULES, ".bin")
KARMA = File::join(NPM_BIN, "karma")

PACKAGE_CONFIG= {
  #{MAJOR: incompatible}.{MINOR added feature}.{PATCH bugfix}-{LABEL}
  "VERSION" => "0.12.1",
  "BUILD_DATE" => Time.new.strftime("%m-%d-%Y"),
  "COPYRIGHT_YEAR" => Time.new.strftime("%Y")
}

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
    require 'haml'
    require 'sass'
    template = File::read(t.source)
    engine = Sass::Engine.new(template)
    File::open(t.name, "w") do |f|
      f.write(engine.render)
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

  #desc "Generates all HTML docco based on HAML"
  task :generate

  docfiles.each do |path|
    dir = File::dirname(path)
    directory dir
    task :generate => [dir, path]
  end
end

namespace :test do
  task :start => 'src/deps.js' do
    exec(KARMA, "start")
  end

  desc "Force Karma to run the test suite"
  task :run => 'src/deps.js' do
    exec(KARMA, "run")
  end

  task :built => "generated/javascript/ninjascript.js" do
    sh(KARMA, "start", "karma-built.conf.js")
  end

  task :min => "generated/javascript/ns.min.js" do
    sh(KARMA, "start", "karma-min.conf.js")
  end

  task :generated => [:built, :min]
end

namespace :stylesheets do
  stylefiles = Rake::FileList['src/sass/**/*.sass']
  stylefiles.sub!(
    %r{\Asrc/sass/(.*)\.sass\Z},
    "src/assets/css/\\1.css"
  )

  #desc "Generates the CSS for use with NinjaScript"
  task :generate

  stylefiles.each do |path|
    dir = File::dirname(path)
    directory dir
    task :generate => [dir, path]
  end
end

task :buildtools => 'buildtools:all'

namespace :buildtools do
  directory BUILDTOOLS_DIR
  closure_zip = File::join(BUILDTOOLS_DIR, "closure.zip")

  file closure_zip => BUILDTOOLS_DIR do
    puts %x{curl http://closure-compiler.googlecode.com/files/compiler-latest.zip -o #{closure_zip}}
  end

  file CLOSURE_JAR => closure_zip do
    puts %x{unzip -d #{BUILDTOOLS_DIR} #{closure_zip}}
  end

  task :npm_install do
    sh 'npm install'
  end

  task :all => [:npm_install, CLOSURE_JAR]
end

namespace :build do
  directory "generated/javascript"
  directory "auto-constants"
  directory "tmp"

  task :constants => %w{auto-constants} do
    require 'yaml'

    File::open("auto-constants/constants.yml", "w") do |file|
      file.write(YAML::dump(PACKAGE_CONFIG))
    end
  end

  sourcefiles = FileList['src/javascript/**/*.js']

  file "tmp/header-comments.js" => "tmp" do |file|
    require 'erb'
    erb = ERB.new(File::read('src/header-comment.js.erb'))
    File::open(file.to_s, "w") do |file|
      build_date = PACKAGE_CONFIG["BUILD_DATE"]
      copyright_year = PACKAGE_CONFIG["COPYRIGHT_YEAR"]
      version = PACKAGE_CONFIG["VERSION"]
      file.write( erb.result binding)
    end
  end

  file "src/deps.js" => sourcefiles do |file|
    sh %{/usr/bin/env python #{CLOSURE_DEPSWRITER} --root_with_prefix="src/javascript #{CLOSURE_DOTS}/src/javascript" > #{file}}
  end

  file "dependency.MF" => sourcefiles do |file|
    sh %{/usr/bin/env java -jar #{CLOSURE_JAR} #{sourcefiles.map{|src| "--js #{src}"}.join(" ")} --output_manifest #{file}}
  end

  task :clobber_header_comments do
    rm_f 'tmp/header-comments.js'
  end

  file "generated/javascript/ninjascript.js" => %w{tmp/header-comments.js generated/javascript} + sourcefiles do |file|
    puts sourcefiles
    tmpfile = File::join("tmp", file.to_s.gsub(File::Separator, "_"))
    sh "java -jar #{BUILDTOOLS_DIR}/compiler.jar \
    --closure_entry_point 'ninjascript.loaded' \
    --create_source_map 'generated/javascript/ninjascript-sourcemap-js' \
    --formatting PRETTY_PRINT \
    --manage_closure_dependencies \
    #{sourcefiles.map{|file| "--js #{file} "}} \
    --js_output_file #{tmpfile}"

    sh "cat tmp/header-comments.js #{tmpfile} > #{file}"
  end

  file "generated/javascript/ns.min.js" =>
  %w{generated/javascript/ninjascript.js tmp/header-comments.js} do |file|
    tmpfile = File::join("tmp", file.to_s.gsub(File::Separator, "_"))
    sh "java -jar #{BUILDTOOLS_DIR}/compiler.jar --js generated/javascript/ninjascript.js --js_output_file #{tmpfile}"
    sh "cat tmp/header-comments.js #{tmpfile} > #{file}"
  end

  #desc "Build Ninjascript & assets"
  task :project => %w{stylesheets:generate clobber_header_comments generated/javascript/ninjascript.js generated/javascript/ns.min.js}

  namespace :package do
    task :package

    task :repackage => [:clobber_package, :package]

    task :clobber_package do
      rm_r "pkg" rescue nil
    end

    task :clobber => [:clobber_package]

    package_name = "ninjascript-#{PACKAGE_CONFIG["VERSION"]}"
    package_dir_path = "pkg/ninjascript"
    package_files = Rake::FileList.new
    %w{javascript css images}.each do |type|
      package_files.include("generated/#{type}/**/*")
    end

    task :package => "test:generated"

    [ "#{package_name}.tgz", "#{package_name}.tbz2" ].each do |file|
      task :package => ["pkg/#{file}"]
      file "pkg/#{file}" => [package_dir_path] + package_files do
        chdir("pkg") do
          sh %{tar --auto-compress -cvf #{file} ninjascript}
        end
      end
    end

    task :package => ["pkg/#{package_name}.zip"]
    file "pkg/#{package_name}.zip" => [package_dir_path] + package_files do
      chdir("pkg") do
        sh %{zip -r #{package_name}.zip ninjascript}
      end
    end

    directory "pkg"

    file package_dir_path => package_files do
      mkdir_p "pkg" rescue nil
      package_files.each do |source|
        target = source.sub(/\Agenerated\//,'')
        f = File.join(package_dir_path, target)
        fdir = File.dirname(f)
        mkdir_p(fdir) unless File.exist?(fdir)
        if File.directory?(source)
          mkdir_p(f)
        else
          rm_f f
          safe_ln(source, f)
        end
      end
    end
    self
  end

  task :package => 'package:package'

  desc "Force a rebuild of the package files"
  task :repackage => 'package:repackage'

  task :package => :project
end

desc "Start a Karma test server"
task :default => 'test:start'

desc "Build the project and produce archived packages"
task :build => "build:package"

#desc "Generate all static content from source files"
