import Phaser from "phaser";
import * as Core from "../core";
import * as Types from "../types";
import { AbstractScene } from "./abstractscene";

export class ConnectScene extends AbstractScene implements Types.EventListener {

    private width: number;
    private height: number;
    private config: any;
    private auth: string;
    private loadingText: Phaser.GameObjects.Text;

    public constructor(controller: Core.Controller) {
        super('connectScene', controller);
        controller.addEventListener(this);
    }

    public init(config) {
        this.width = this.sys.canvas.width;
        this.height = this.sys.canvas.height;

        this.config = config;
    }

    public preload() {
        // The initial game config is a fixed 960x540 - stretch the canvas to
        // the actual viewport (same pattern MainScene.resize() uses) so this
        // screen, including any error text, fits on a narrow/mobile screen
        // instead of running off the edge of a canvas wider than the device.
        this.sys.canvas.style.width = "100%";
        this.sys.canvas.style.height = "100%";
        let width = this.sys.canvas.clientWidth;
        let height = this.sys.canvas.clientHeight;
        this.scale.resize(width, height);

        this.loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 50,
            text: 'Connecting...',
            style: {
                font: '20px monospace',
                color: '#ffffff',
                align: 'center',
                // Error messages (e.g. a failed server address) can be longer than
                // fits on one line, and the canvas itself isn't scrollable/zoomable -
                // wrap instead of letting the text run off the edge unseen.
                wordWrap: { width: width - 40, useAdvancedWrap: true },
            }
        });
        this.loadingText.setOrigin(0.5, 0.5);

        this.controller.connect(this.config);

    }

    public create(config) {
        this.add.existing(this.loadingText);
    }

    public update() {
    }

    public handleEvent(event: Types.EventType, data?: any) {
        if (event == Types.EventType.ConnectionInfoChanged) {
            this.updateLoadingText();
        }
    }

    /**
     * Surfaces the handshake state (serverStatus/serverVersion/serverJoin) on the
     * loading screen instead of it only being visible in the console. A non-OK
     * server status (e.g. maintenance) takes priority since it blocks connecting
     * outright; otherwise we show progress through the join handshake.
     */
    private updateLoadingText() {
        if (this.loadingText == null) {
            return;
        }

        let connectionInfo = this.controller.Game.getConnectionInfo();

        if (connectionInfo.getConnectionError()) {
            this.loadingText.setText(connectionInfo.getConnectionError());
            return;
        }

        if (!connectionInfo.isServerAvailable()) {
            this.loadingText.setText("Server unavailable: " + connectionInfo.getServerStatusMessage());
            return;
        }

        if (connectionInfo.hasVersionMismatch()) {
            this.loadingText.setText(
                "Client version mismatch (server expects " + connectionInfo.getServerVersion() + ")"
            );
            return;
        }

        if (connectionInfo.isPasswordChallengeIssued() && !connectionInfo.isJoined()) {
            this.loadingText.setText("Authenticating...");
            return;
        }

        if (connectionInfo.isJoined()) {
            this.loadingText.setText("Joined as " + connectionInfo.getCoach() + "...");
            return;
        }
    }
}
