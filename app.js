document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const calculateBtn = document.getElementById('calculate-btn');
    const resultsContainer = document.getElementById('results-container');
    const resultCardTemplate = document.getElementById('result-card-template');
    
    // 计算按钮点击事件
    calculateBtn.addEventListener('click', function() {
        // 获取用户输入
        const inputs = {
            // 风险类型
            heatIsland: document.getElementById('heat-island').checked,
            flooding: document.getElementById('flooding').checked,
            pollution: document.getElementById('pollution').checked,
            recreation: document.getElementById('recreation').checked,
            
            // 风险等级
            riskLevel: document.getElementById('risk-level').value,
            
            // 结构优化需求
            structureOpt: document.getElementById('structure-opt').checked,
            
            // 区位特征
            location: document.getElementById('location').value,
            
            // 建设密度
            density: document.getElementById('density').value,
            
            // 用地类型
            residential: document.getElementById('residential').checked,
            commercial: document.getElementById('commercial').checked,
            road: document.getElementById('road').checked,
            park: document.getElementById('park').checked,
            agriculture: document.getElementById('agriculture').checked,
            waterfront: document.getElementById('waterfront').checked
        };
        
        // 计算每个NBS的得分
        const results = calculateScores(inputs);
        
        // 显示结果
        displayResults(results);
    });
    
    // 计算NBS得分
    function calculateScores(inputs) {
        // 权重设置
        const weights = {
            heatIsland: 0.3,
            flooding: 0.3,
            pollution: 0.2,
            recreation: 0.2,
            structure: 0.5,
            highRisk: 1.2,
            mediumRisk: 1.0,
            lowRisk: 0.8
        };
        
        // 风险等级调整因子
        let riskFactor;
        switch(inputs.riskLevel) {
            case 'high': riskFactor = weights.highRisk; break;
            case 'medium': riskFactor = weights.mediumRisk; break;
            case 'low': riskFactor = weights.lowRisk; break;
        }
        
        // 单一风险加权
        const riskCount = [inputs.heatIsland, inputs.flooding, inputs.pollution, inputs.recreation].filter(Boolean).length;
        const singleRiskBonus = (riskCount === 1) ? 0.5 : 0;
        
        // 计算每个NBS的得分
        let scores = nbsData.map(nbs => {
            // 风险得分
            let riskScore = 0;
            if (inputs.heatIsland) riskScore += nbs.heatIsland * weights.heatIsland;
            if (inputs.flooding) riskScore += nbs.flooding * weights.flooding;
            if (inputs.pollution) riskScore += nbs.pollution * weights.pollution;
            if (inputs.recreation) riskScore += nbs.recreation * weights.recreation;
            
            // 应用风险等级和单一风险加权
            riskScore = riskScore * riskFactor * (1 + singleRiskBonus);
            
            // 结构优化得分
            const structureScore = inputs.structureOpt ? nbs.structure * weights.structure : 0;
            
            // 空间适应性得分
            let locationScore = 0;
            switch(inputs.location) {
                case 'inner': locationScore = nbs.innerLocation; break;
                case 'middle': locationScore = nbs.middleLocation; break;
                case 'outer': locationScore = nbs.outerLocation; break;
            }
            
            let densityScore = 0;
            switch(inputs.density) {
                case 'high': densityScore = nbs.highDensity; break;
                case 'medium': densityScore = nbs.mediumDensity; break;
                case 'low': densityScore = nbs.lowDensity; break;
            }
            
            const spaceScore = (locationScore * 0.5 + densityScore * 0.5);
            
            // 用地类型适应性得分
            let landScore = 0;
            let landCount = 0;
            
            if (inputs.residential) { landScore += nbs.residential; landCount++; }
            if (inputs.commercial) { landScore += nbs.commercial; landCount++; }
            if (inputs.road) { landScore += nbs.road; landCount++; }
            if (inputs.park) { landScore += nbs.park; landCount++; }
            if (inputs.agriculture) { landScore += nbs.agriculture; landCount++; }
            if (inputs.waterfront) { landScore += nbs.waterfront; landCount++; }
            
            landScore = landCount > 0 ? landScore / landCount : 0;
            
            // 总得分
            const totalScore = riskScore + structureScore + spaceScore + landScore - nbs.difficulty / 2;
            
            // 确定优先级
            let priority;
            if (totalScore >= 7) priority = "高";
            else if (totalScore >= 4) priority = "中";
            else priority = "低";
            
            return {
                ...nbs,
                score: totalScore,
                priority: priority
            };
        });
        
        // 按得分降序排序
        scores.sort((a, b) => b.score - a.score);
        
        // 去除重复项
        const uniqueResults = [];
        const seenNames = new Set();
        
        for (const result of scores) {
            if (!seenNames.has(result.name)) {
                seenNames.add(result.name);
                uniqueResults.push(result);
                if (uniqueResults.length >= 10) break; // 最多显示10个结果
            }
        }
        
        return uniqueResults;
    }
    
    // 显示结果
    function displayResults(results) {
        // 清空结果容器
        resultsContainer.innerHTML = '';
        
        // 添加结果卡片
        results.forEach((result, index) => {
            const resultCard = resultCardTemplate.content.cloneNode(true);
            
            // 设置排名和得分
            resultCard.querySelector('.nbs-name').textContent = `${index + 1}. ${result.name}`;
            resultCard.querySelector('.score-badge').textContent = `得分: ${result.score.toFixed(2)}`;
            resultCard.querySelector('.score-badge').classList.add(result.score >= 7 ? 'bg-success' : (result.score >= 4 ? 'bg-warning' : 'bg-danger'));
            
            // 设置优先级
            resultCard.querySelector('.priority-badge').textContent = `${result.priority}优先级`;
            resultCard.querySelector('.priority-badge').classList.add(result.priority === "高" ? 'bg-success' : (result.priority === "中" ? 'bg-warning' : 'bg-danger'));
            
            // 设置功能和场景
            resultCard.querySelector('.nbs-function').textContent = result.function;
            resultCard.querySelector('.nbs-scenario').textContent = `适用场景: ${result.scenario}`;
            
            // 设置图片
            resultCard.querySelector('.nbs-image').src = result.image;
            resultCard.querySelector('.nbs-image').alt = result.name;
            
            // 添加到结果容器
            resultsContainer.appendChild(resultCard);
        });
    }
});
