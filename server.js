const express = require('express');
const cors    = require('cors');
const fs      = require('fs');
const path    = require('path');

const app        = express();
const PORT       = 3001;
const SCORES_FILE = path.join(__dirname, 'scores.json');

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

if (!fs.existsSync(SCORES_FILE)) {
    fs.writeFileSync(SCORES_FILE, JSON.stringify([]));
}

// GET /api/scores  →  상위 10개 반환 (점수 내림차순, 동점 시 시간 오름차순)
app.get('/api/scores', (req, res) => {
    try {
        const list = JSON.parse(fs.readFileSync(SCORES_FILE, 'utf8'));
        list.sort((a, b) => b.score - a.score || a.time - b.time);
        res.json(list.slice(0, 10));
    } catch {
        res.json([]);
    }
});

// POST /api/scores  →  점수 저장
app.post('/api/scores', (req, res) => {
    try {
        const { name, score, time } = req.body;
        if (!name || typeof score !== 'number' || typeof time !== 'number') {
            return res.status(400).json({ error: '잘못된 데이터입니다.' });
        }
        const list = JSON.parse(fs.readFileSync(SCORES_FILE, 'utf8'));
        list.push({
            name:  String(name).slice(0, 20),
            score: Math.max(0, Math.floor(score)),
            time:  Math.max(0, Math.floor(time)),
            date:  new Date().toLocaleDateString('ko-KR'),
        });
        fs.writeFileSync(SCORES_FILE, JSON.stringify(list, null, 2));
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});

app.listen(PORT, () => {
    console.log('');
    console.log('🃏 낱말 관계 카드 뒤집기 게임 서버');
    console.log(`🌐 브라우저에서 열기 → http://localhost:${PORT}`);
    console.log(`📁 점수 저장 파일   → ${SCORES_FILE}`);
    console.log('');
});
