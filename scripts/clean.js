import fs from "fs";
import {Logger} from "@tenorium/utilslib";


fs.rmdirSync("build");

Logger.info("Build files cleared!");