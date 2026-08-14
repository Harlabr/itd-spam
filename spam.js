(async () => {
    console.clear();
    console.log("%скрипт запущен", "color: #fff; background: #d32f2f; padding: 10px; font-weight: bold;");

    let currentToken = '';
    let globalCounter = 1;

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
        const text = "GITHUB github.com/Harlabr/itd-spam"; 
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
            if (i % 10 === 0 || i < 5) {
                console.log("кд: " + i + " сек");
            }
            await new Promise(r => setTimeout(r, 1000));
        }
    }

    while(true) {
        if (!currentToken) {
            currentToken = await refreshMyToken();
            if (!currentToken) {
                console.log(" [!] ошибка токена.  ждем 10 сек");
                await new Promise(r => setTimeout(r, 10000));
                continue;
            }
        }

        const time = new Date().toLocaleTimeString();
        console.log("%c[" + time + "] --- отправка постов ---", "color: white; background: black");

        for (let i = 1; i <= 3; i++) {
            let status = await fire(currentToken);

            if (status === 201 || status === 200) {
                console.log("  %c[+] Пост " + globalCounter + " отправлен", "color: lime");
                globalCounter++;
            } else if (status === 429) {
                console.log("  %c 429 too many requests", "color: orange");
                break; 
            } else if (status === 401) {
                console.log("  %c[!] токен сдох", "color: red");
                currentToken = null; 
                break; 
            }
            if (i < 3) await new Promise(r => setTimeout(r, 1));
        }

        if (currentToken) { 
            await waitSeconds(60); 
        }
    }
})();
