//
//  BulkOSViewController.swift
//  App
//
//  App-local Capacitor plugins aren't auto-discovered — they have to be
//  registered explicitly once the bridge is up. Main.storyboard points at
//  this controller instead of CAPBridgeViewController so `WatchBridge`
//  becomes callable from JavaScript.
//

import Capacitor
import UIKit

class BulkOSViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(WatchBridgePlugin())
    }
}
