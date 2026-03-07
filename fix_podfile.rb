require 'fileutils'

podfile_path = 'ios/Podfile'
content = File.read(podfile_path)

# Replace the post_install section
new_post_install = << 'NEW_POST_INSTALL'
  post_install do |installer|
    react_native_post_install(
      installer,
      config[:reactNativePath],
      :mac_catalyst_enabled => false,
      :ccache_enabled => ccache_enabled?(podfile_properties),
    )
    
    # Fix for Swift Sendable warnings in Xcode 16.0
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        config.build_settings['SWIFT_STRICT_CONCURRENCY'] = 'OFF'
        config.build_settings['SWIFT_SENDABLE_CHECK'] = 'OFF'
        config.build_settings['SWIFT_ENFORCE_EXCLUSIVE_ACCESS'] = 'OFF'
      end
    end
  end
NEW_POST_INSTALL

content.gsub!(/  post_install do \|installer\|.*?^  end$/m, new_post_install.strip)

File.write(podfile_path, content)
puts "Podfile updated successfully"
