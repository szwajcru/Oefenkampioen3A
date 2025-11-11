/**
 * Class: SessieManager
 * Auteur      : RP Szwajcer
 * Datum       : 11-11-2025
 * Doel        : Beheren van oefensessies met FIFO-logica en evenwichtige spreiding.
 *
 * Beschrijving:
 * - Houdt per anker een pool van woorden bij in localStorage.
 * - Elk woord wordt één keer aangeboden totdat de pool leeg is.
 * - Pool wordt opnieuw opgebouwd met een gespreide (multi-shuffle) structuur.
 * - Laatste woord wordt tijdelijk bewaard in sessionStorage om directe herhaling te voorkomen.
 */

const SessieManager = (function () {

    /** Haal sessiedata op of maak nieuw object */
    function loadSessie(key) {
        const data = JSON.parse(localStorage.getItem('OefenPool_Anker_' + key) || 'null');
        return data && Array.isArray(data.pool)
            ? data
            : { pool: [] };
    }

    /** Sla sessiedata op */
    function saveSessie(key, pool) {
        localStorage.setItem('OefenPool_Anker_' + key, JSON.stringify({ pool }));
    }

    /** Fisher–Yates shuffle */
    function shuffle(array) {
        const arr = array.slice();
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    /** Pool opnieuw vullen */
    function vernieuwPool(ankerNummer, key) {
        const woorden = getWoordenVoorAnker(ankerNummer, key);
        if (!woorden || !woorden.length) {
            console.warn(`⚠️ Geen woorden gevonden voor ${key}`);
            return { nieuwePool: [] };
        }

        const basisPool = woorden.slice();

        // 🔹 Maak meerdere geshuffelde kopieën (voor variatie)
        const herhalingen = 1;
        const kopieën = Array.from({ length: herhalingen }, () => shuffle([...basisPool]));

        // 🔹 Evenwichtig verweven (interleaven) van kopieën
        const nieuwePool = [];
        for (let i = 0; i < basisPool.length; i++) {
            for (let j = 0; j < herhalingen; j++) {
                const woord = kopieën[j][i];
                if (woord !== undefined) nieuwePool.push(woord);
            }
        }

        // 🔹 Anti-dubbelburen-fix — voorkomt dat hetzelfde woord direct naast elkaar staat
        for (let i = 1; i < nieuwePool.length; i++) {
            if (nieuwePool[i] === nieuwePool[i - 1]) {
                const swapIndex = (i + 3) % nieuwePool.length;
                [nieuwePool[i], nieuwePool[swapIndex]] = [nieuwePool[swapIndex], nieuwePool[i]];
            }
        }

        console.info(
            `🆕 Pool vernieuwd voor ${key}: ${basisPool.length} unieke woorden × ${herhalingen} = ${nieuwePool.length} totale items`
        );

        return { nieuwePool };
    }

    /** Volgend woord ophalen */
    function volgendWoord(ankerNummer, key) {
        let sessie = loadSessie(key);
        let { pool } = sessie;

        // --- Pool opschonen van woorden die niet meer bestaan ---
        const woorden = getWoordenVoorAnker(ankerNummer, key);
        const geldigeSet = new Set(woorden);
        pool = pool.filter(w => geldigeSet.has(w));

        // --- Pool vernieuwen indien leeg ---
        if (pool.length === 0) {
            const resultaat = vernieuwPool(ankerNummer, key);
            pool = resultaat.nieuwePool;
        }

        // --- Kies het eerste woord uit de pool ---
        let woord = pool.shift();
        if (!woord) return null;

        // --- Update counters ---
        updateWoordLog(key, woord);

        // --- Opslaan sessie ---
        saveSessie(key, pool);

        return woord;
    }

    /** Reset sessie */
    function reset(key) {
        localStorage.removeItem('OefenPool_Anker_' + key);
        console.info('🧹 Sessie gereset voor', key);
    }

    /** Debug: toon huidige poolstatus */
    function debug(key) {
        const sessie = loadSessie(key);
        const laatste = sessionStorage.getItem('Laatste_woord_Anker_' + key);
        console.table(sessie.pool.map((w, i) => ({ index: i + 1, woord: w })));
        console.log('📘 Huidige poollengte:', sessie.pool.length);
        console.log('🕓 Laatste woord:', laatste);
    }

    return { volgendWoord, reset, debug };

})();
