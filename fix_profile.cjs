const fs = require('fs');
let code = fs.readFileSync('src/pages/Profile.tsx', 'utf-8');

// Seems I corrupted the DOM. Let's fix it manually.
code = code.replace(
    /<\/div>\n          <\/div>\n        <\/motion\.div>/,
    `</div>\n          </div>\n        </motion.div>`
); // The replace failed, let's just use sed or do it with code
