import { join } from "path";

import tmpDir from "../utils/tmpDir";

const socketPath = join(tmpDir, "replSocket");

export default socketPath;
