import AppIntents
import UIKit

/// "Log weight": opens today's weight entry from the Action button, Siri, Spotlight or the
/// Shortcuts app. The app opens first, then the link; Expo Router keeps a link that comes in
/// before the JS is running. Translations: plugins/weight-shortcut/strings.json.
struct LogWeightIntent: AppIntent {
  static let title: LocalizedStringResource = "Log weight"
  static let description = IntentDescription("Opens today's weight entry.")
  static let openAppWhenRun = true

  @MainActor
  func perform() async throws -> some IntentResult {
    if let url = URL(string: "loqqa://body-weight/today") {
      _ = await UIApplication.shared.open(url)
    }
    return .result()
  }
}

/// Lists "Log weight" under the app in Shortcuts, Spotlight and the Action button settings, no
/// setup needed. Those list a shortcut only with a short title and a symbol, which need iOS 17,
/// as the Action button does.
@available(iOS 17.0, *)
struct LoqqaShortcuts: AppShortcutsProvider {
  static var appShortcuts: [AppShortcut] {
    AppShortcut(
      intent: LogWeightIntent(),
      phrases: [
        "Log weight in \(.applicationName)",
        "Log my weight in \(.applicationName)",
      ],
      shortTitle: "Log weight",
      systemImageName: "scalemass"
    )
  }
}
