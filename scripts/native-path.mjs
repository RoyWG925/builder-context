// Windows MSIX file redirection can expose a logical AppData path only inside
// the desktop app. Task Scheduler needs the physical path visible to Windows.
import {realpathSync} from 'node:fs';
if(process.argv.length!==3)throw Error('Supply one existing path');
console.log(realpathSync.native(process.argv[2]));
