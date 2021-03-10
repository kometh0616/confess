import { Client, Message, Snowflake, TextChannel } from "discord.js";
import config from "../config.json";

export default class Confessor extends Client {

    public config: {
        channelID: Snowflake,
        token: string
    };

    constructor() {

        super({ disableMentions: "everyone" });

        const channelID = process.argv.length >= 3 ? 
            process.argv[2] : config.channelID.length > 0 ?
            config.channelID : (() => { throw new Error("No channel ID supplied.") })();
        
        this.config = {
            channelID, token: config.token
        };

    }

    private async getChannel(): Promise<TextChannel | null> {
        try {
            const channel = await this.channels.fetch(this.config.channelID);
            return channel instanceof TextChannel ? channel : null;
        } catch (e) {
            return null;
        }
    }

    private async processConfession(message: Message, channel: TextChannel): Promise<void> {
        if (message.channel.type === "dm" && !message.author.bot) {
            await channel.send(this.editText(message.content), [...message.attachments.values()]);
        }
    }

    private editText(str: string): string {
        let result = str.replace(/,/gi, "")
            .replace(/'/gi, "")
            .toLowerCase();
        let sliceAmount = 0;
        for (let i = result.length - 1; i != 0; i--) {
            if (result[i] === '.') {
                sliceAmount++;
            } else break;
        }
        return result.slice(0, result.length - sliceAmount);
    }

    public async init(): Promise<void> {
        let channel: TextChannel;
        this.on("ready", async () => {
            console.log("I have come online! The confession channel ID is", this.config.channelID);
            const ch = await this.getChannel();
            if (ch !== null) channel = ch;
            else throw new Error("No text channel found.");
        });

        this.on("message", async message => this.processConfession(message, channel));

        this.login(this.config.token);
    }
}