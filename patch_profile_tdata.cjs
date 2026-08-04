const fs = require('fs');
let code = fs.readFileSync('src/pages/Profile.tsx', 'utf-8');

const tdataButton = `
                            <Button 
                                className="flex-1 text-xs py-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 mt-2 w-full"
                                onClick={() => {
                                    window.location.href = '/api/product/' + p.productId + '/tdata';
                                }}
                            >
                                Скачать TData
                            </Button>
`;

code = code.replace(
    /<\/div>\n                        \{purchaseCode\[p\.purchaseId\] && \(/,
    tdataButton + "\n                        </div>\n                        {purchaseCode[p.purchaseId] && ("
);

fs.writeFileSync('src/pages/Profile.tsx', code);
