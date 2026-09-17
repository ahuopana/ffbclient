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
        let width = this.cameras.main.width;
        let height = this.cameras.main.height;
        this.loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 50,
            text: 'Connecting...',
            style: {
                font: '20px monospace',
                color: '#ffffff'
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
