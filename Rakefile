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

BUILDTOOLS_DIR = "buildtools"
JS_TEST_DRIVER_DIR = File::join(BUILDTOOLS_DIR, "js-test-driver/JsTestDriver")
JS_TEST_DRIVER_JAR = File::join(JS_TEST_DRIVER_DIR, "target/bin/JsTestDriver.jar")
CLOSURE_COMPILER_DIR = File::join(BUILDTOOLS_DIR, "closure-compiler")
CLOSURE_JAR = File::join(CLOSURE_COMPILER_DIR, "build", "compiler.jar")
CLOSURE_DIR = File::join(BUILDTOOLS_DIR, "google-closure-library/closure")
CLOSURE_DEPSWRITER = File::join(CLOSURE_DIR, "bin/build/depswriter.py")
CLOSURE_LIBRARY_DIR = File::join(CLOSURE_DIR, "goog")
CLOSURE_DOTS = File::join(*(%w{..} * CLOSURE_LIBRARY_DIR.split(File::Separator).length))
SINON_DIR = File::join(BUILDTOOLS_DIR, "sinon")

namespace :test do
  desc "Run JSTestDriver Server"
  task :server => 'jsTestDriver.conf' do
    puts %x{/bin/env java -jar #{JS_TEST_DRIVER_JAR} --port 9876 &}
  end

  desc "Run chrome against server"
  task :chromium do
    %x{/bin/env chromium --new-window localhost:9876/capture &}
  end

  desc "Run firefox against server"
  task :firefox do
    %x{/bin/env firefox localhost:9876/capture &}
  end

  desc "Run tests against JSTestDriver"
  task :run, [:tests] => %w'src/deps.js jsTestDriver.conf' do |task, args|
    unless args[:tests].nil? or args[:tests].empty?
      tests = args[:tests]
    else
      tests = "all"
    end
    sh %{/bin/env java -jar #{JS_TEST_DRIVER_JAR} --captureConsole --runnerMode DEBUG --testOutput test-results --tests "#{tests}"}
  end

  desc "Reset browsers and run tests against JSTestDriver"
  task :reset, [:tests] => %w'src/deps.js jsTestDriver.conf' do |task, args|
    unless args[:tests].nil? or args[:tests].empty?
      tests = args[:tests]
    else
      tests = "all"
    end
    sh %{/bin/env java -jar #{JS_TEST_DRIVER_JAR} --captureConsole --runnerMode DEBUG --reset --testOutput test-results --tests "#{tests}"}
  end
end

task :buildtools => %w{buildtools:jstestdriver buildtools:jstestdriver_coverage buildtools:closure_compiler buildtools:sinon}

namespace :buildtools do
  task :jstestdriver do
    chdir JS_TEST_DRIVER_DIR do
      puts "Running ant"
      puts %x{ant jstestdriver}
    end
  end

  task :jstestdriver_coverage do
    chdir JS_TEST_DRIVER_DIR do
      puts "Running ant"
      puts %x{ant jstestdriver-coverage}
    end
  end


  task :closure_compiler do
    chdir CLOSURE_COMPILER_DIR do
      puts "Running ant"
      puts %x{ant jar}
    end
  end

  task :sinon do
    chdir SINON_DIR do
      sh "./build"
    end
  end
end

namespace :build do

  directory "generated/javascript"
  directory "auto-constants"
  directory "tmp"

  PACKAGE_CONFIG= {
    "VERSION" => "0.10",
    "BUILD_DATE" => Time.new.strftime("%m-%d-%Y"),
    "COPYRIGHT_YEAR" => Time.new.strftime("%Y")
  }

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
      copyright_year = COPYRIGHT_YEAR["COPYRIGHT_YEAR"]
      version = PACKAGE_CONFIG["VERSION"]
      file.write( erb.result binding)
    end
  end

  file "src/deps.js" => sourcefiles do |file|
    sh %{/bin/env #{CLOSURE_DEPSWRITER} --root_with_prefix="src/javascript #{CLOSURE_DOTS}/src/javascript" > #{file}}
  end

  file "dependency.MF" => sourcefiles do |file|
    sh %{/bin/env java -jar #{CLOSURE_JAR} #{sourcefiles.map{|src| "--js #{src}"}.join(" ")} --output_manifest #{file}}
  end

  file 'jsTestDriver.conf' => ['jsTestDriver.yaml', 'dependency.MF'] do |cfg|
    require 'yaml'
    jstd_conf = YAML::load(File::read('jsTestDriver.yaml'))
    deps = File::read("dependency.MF").lines.map{|line| line.chomp}
    jstd_conf['load'] += deps
    File::open(cfg.name, 'w') do |file|
      file.write(YAML::dump(jstd_conf))
    end
  end

  task :clobber_header_comments do
    rm_f 'tmp/header-comments.js'
  end

  file "generated/javascript/ninjascript.js" => %w{tmp/header-comments.js generated/javascript} + sourcefiles do |file|
    tmpfile = File::join("tmp", file.to_s.gsub(File::Separator, "_"))
    sh "libs/requirejs/build/buildj.sh name=main out=#{tmpfile} baseUrl=src/javascript includeRequire=true optimize=none"
    sh "cat tmp/header-comments.js #{tmpfile} > #{file}"
  end

  file "generated/javascript/ns.min.js" =>
  %w{generated/javascript/ninjascript.js tmp/header-comments.js} do |file|
    tmpfile = File::join("tmp", file.to_s.gsub(File::Separator, "_"))
    sh "java -jar libs/compiler.jar --js generated/javascript/ninjascript.js --js_output_file #{tmpfile}"
    sh "cat tmp/header-comments.js #{tmpfile} > #{file}"
  end

  desc "Build Ninjascript & assets"
  task :project => %w{stylesheets:generate clobber_header_comments generated/javascript/ninjascript.js generated/javascript/ns.min.js}

  require 'rake/packagetask'
  Rake::PackageTask.new('ninjascript', PACKAGE_CONFIG["VERSION"]) do |t|
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
