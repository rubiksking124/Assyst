"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseCommand = void 0;
const detritus_client_1 = require("detritus-client");
const config_json_1 = require("../../config.json");
const constants_1 = require("../constants");
class BaseCommand extends detritus_client_1.Command.Command {
    constructor(commandClient, options) {
        super(commandClient, Object.assign({
            name: '',
            ratelimits: [
                { duration: 5000, limit: 5, type: 'guild' },
                { duration: 1000, limit: 1, type: 'channel' }
            ]
        }, options));
        this.responseOptional = true;
    }
    onBefore(context) {
        const oldEditOrReply = context.editOrReply.bind(context);
        context.editOrReply = (options) => {
            if (typeof options === 'string') {
                return oldEditOrReply({
                    content: options,
                    allowedMentions: {
                        parse: []
                    }
                });
            }
            else {
                return oldEditOrReply(Object.assign(Object.assign({}, options), { allowedMentions: {
                        parse: []
                    } }));
            }
        };
        return true;
    }
    onRunError(context, _, error) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const commandClient = context.commandClient;
            console.log(error);
            const description = [error.message || error.stack];
            if (error.response) {
                const response = error.response;
                try {
                    const information = yield response.json();
                    if ('errors' in information) {
                        for (const key in information.errors) {
                            const value = information.errors[key];
                            let message;
                            if (typeof (value) === 'object') {
                                message = JSON.stringify(value);
                            }
                            else {
                                message = String(value);
                            }
                            description.push(`**${key}**: ${message}`);
                        }
                    }
                }
                catch (e) {
                    description.push(yield response.text());
                }
            }
            commandClient.executeLogWebhook(config_json_1.logWebhooks.commandErrors, {
                embed: {
                    color: constants_1.EmbedColors.ERROR,
                    description: description.join('\n'),
                    fields: [
                        {
                            name: 'Command',
                            value: ((_a = context.command) === null || _a === void 0 ? void 0 : _a.name) || '',
                            inline: true
                        }
                    ],
                    title: '⚠️ Command Error'
                }
            });
        });
    }
}
exports.BaseCommand = BaseCommand;
