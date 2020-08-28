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
exports.Assyst = void 0;
const detritus_client_1 = require("detritus-client");
const fapi_client_1 = require("fapi-client");
const config_json_1 = require("../config.json");
const zx8_1 = require("./rest/zx8");
class Assyst extends detritus_client_1.CommandClient {
    constructor(token, options) {
        super(token, options);
        this.directory = options.directory;
        this.fapi = new fapi_client_1.Client.Client({
            auth: config_json_1.tokens.fapi
        });
        this.zx8 = new zx8_1.Zx8();
        // this.on('commandError', console.log);
        // this.on('commandFail', console.log);
    }
    executeLogWebhook(url, options) {
        const searchString = 'webhooks';
        const index = url.indexOf(searchString);
        if (index === -1) {
            throw new Error('Invalid Discord webhook URL provided');
        }
        const id = url.slice(index + searchString.length + 1, url.lastIndexOf('/'));
        const token = url.slice(url.lastIndexOf('/') + 1);
        return this.rest.executeWebhook(id, token, options);
    }
    resetCommands() {
        return __awaiter(this, void 0, void 0, function* () {
            this.clear();
            yield this.addMultipleIn(this.directory, {
                subdirectories: true
            });
        });
    }
    run(options) {
        const _super = Object.create(null, {
            run: { get: () => super.run }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield this.resetCommands();
            return _super.run.call(this, options);
        });
    }
    onCommandCheck(context, command) {
        return __awaiter(this, void 0, void 0, function* () {
            if (context.user.isClientOwner) {
                return true;
            }
            else if (context.inDm || context.user.bot) {
                return false;
            }
            return true;
        });
    }
    onPrefixCheck() {
        return __awaiter(this, void 0, void 0, function* () {
            return '...';
        });
    }
}
exports.Assyst = Assyst;
