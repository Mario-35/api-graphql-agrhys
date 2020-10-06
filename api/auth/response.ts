/**
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import fs from "fs";

const file = `${__filename.substring(0, __filename.lastIndexOf("."))}.hbs`;
export default fs.readFileSync(file, "utf8");
