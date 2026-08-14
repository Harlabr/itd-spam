(async () => {
    console.clear();
    console.log("%cскрипт запущен. с уникальностю", "color: #fff; background: #4a148c; padding: 10px; font-weight: bold;");

    let currentToken = '';
    let globalCounter = 1;

    function generateId() {
        const charset = "abcdefghijklmnopqrstuvwxyz0123456789";
        let result = "";
        for (let i = 0; i < 9; i++) {
            result += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        return result;
    }

    async function refreshMyToken() {
        try {
            const response = await fetch('/api/v1/auth/refresh', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            if (response.ok) {
                const data = await response.json();
                const newToken = data.accessToken || data.token;
                console.log("%cтокен обновлен", "color: cyan");
                return 'Bearer ' + newToken;
            }
        } catch (e) { console.error(e); }
        return null;
    }

    async function fire(token) {
        const text = generateId() + "Github github.com/Harlabr/itd-spam" + generateId(); 
        try {
            const res = await fetch('/api/posts', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': token 
                },
                body: JSON.stringify({ "content": text })
            });
            return res.status;
        } catch (e) { return 0; }
    }

    async function waitSeconds(seconds) {
        for (let i = seconds; i > 0; i--) {
            if (i % 15 === 0 || i < 5) {
                console.log("сброс лимита: " + i + " сек");
            }
            await new Promise(r => setTimeout(r, 1000));
        }
    }

    while(true) {
        if (!currentToken) {
            currentToken = await refreshMyToken();
            if (!currentToken) {
                console.log("[!] Ошибка доступа. 10с...");
                await new Promise(r => setTimeout(r, 10000));
                continue;
            }
        }

        const time = new Date().toLocaleTimeString();
        console.log("%c[" + time + "] --- отправка постов ---", "color: white; background: #2e7d32");

        for (let i = 1; i <= 3; i++) {
            let status = await fire(currentToken);

            if (status === 201 || status === 200) {
                console.log("  %c[+] пост " + globalCounter + " принят", "color: lime");
                globalCounter++;
            } else if (status === 429) {
                console.log("  %c[!] 429: лимит превышен", "color: orange");
                break; 
            } else if (status === 401) {
                console.log("  %c[!] 401: токен истек", "color: red");
                currentToken = null; 
                break; 
            }
            if (i < 3) await new Promise(r => setTimeout(r, 1));
        }

        if (currentToken) { 
            await waitSeconds(61); 
        }
    }
})();
