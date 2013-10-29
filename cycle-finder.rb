dir = ARGV[0]

provides = {}
reqs = []

Dir["#{dir}/**/*.js"].each do |path|
  provide = nil
  required = []
  File.read(path).lines.grep(/goog[.]/).each do |line|
    if match = /goog.require\(['"]([^)]*)['"]\)/.match(line)
      required << match[1]
    elsif match = /goog.provide\(['"]([^)]*)['"]\)/.match(line)
      raise "Double provide in #{path}!: #{provide}/#{match[0]}" unless provide.nil?
      provide = match[1]
    end
  end
  raise "Provided twice!" if provides.has_key?(provide)
  provides[provide] = required
  reqs += required
end

reqs.uniq!

require 'pp'

missing_reqs = reqs - provides.keys
unless missing_reqs.empty?
  pp :missing_requirements => missing_reqs
end

Step = Struct.new(:prov, :reqs, :filled)

provides.each_pair do |provided, requirements|
  reqs = requirements.dup
  fulfilled = []
  chain = []
  tree = [Step.new(provided, reqs, [])]
  until tree.empty?
    req = tree.last.reqs.shift
    if req.nil?
      tree.pop
      next
    end

    tree.last.filled << req
    need = provides[req] - tree.last.filled

    if need.include? provided
      raise "Cycle detected: #{(tree.map(&:prov) + [req]).inspect} => #{provided}"
    end
    tree.push Step.new(req, need, tree.last.filled.dup + [req])
  end
end

puts "All looks well"
