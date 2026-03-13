class 计时器应用 {
    constructor() {
        this.计时器列表 = [];
        this.计时器定时器 = [];
        
        // 初始化DOM元素
        this.初始化元素();
        // 绑定事件
        this.绑定事件();
        // 加载数据
        this.加载数据();
    }
    
    初始化元素() {
        this.账号输入框 = document.getElementById('account');
        this.时长输入框 = document.getElementById('duration');
        this.提醒输入框 = document.getElementById('remind');
        this.添加按钮 = document.getElementById('addTimer');
        this.计时器表格 = document.getElementById('timerTable').querySelector('tbody');
        this.删除选中按钮 = document.getElementById('removeSelected');
        this.清空所有按钮 = document.getElementById('clearAll');
        this.全选复选框 = document.getElementById('selectAll');
        
        // 模态框元素
        this.提醒模态框 = document.getElementById('reminderModal');
        this.提醒账号 = document.getElementById('reminderAccount');
        this.提醒消息 = document.getElementById('reminderMessage');
        this.关闭提醒按钮 = document.getElementById('closeReminder');
        
        this.错误模态框 = document.getElementById('errorModal');
        this.错误消息 = document.getElementById('errorMessage');
        this.关闭错误按钮 = document.getElementById('closeError');
    }
    
    绑定事件() {
        this.添加按钮.addEventListener('click', () => this.添加计时器());
        this.删除选中按钮.addEventListener('click', () => this.删除选中());
        this.清空所有按钮.addEventListener('click', () => this.清空所有());
        
        // 全选功能
        this.全选复选框.addEventListener('change', (e) => {
            const 复选框列表 = document.querySelectorAll('.checkbox');
            复选框列表.forEach(复选框 => {
                复选框.checked = e.target.checked;
            });
        });
        
        // 模态框关闭按钮
        this.关闭提醒按钮.addEventListener('click', () => this.提醒模态框.style.display = 'none');
        this.关闭错误按钮.addEventListener('click', () => this.错误模态框.style.display = 'none');
        
        // 点击模态框外部关闭
        window.addEventListener('click', (e) => {
            if (e.target === this.提醒模态框) {
                this.提醒模态框.style.display = 'none';
            }
            if (e.target === this.错误模态框) {
                this.错误模态框.style.display = 'none';
            }
        });
    }
    
    添加计时器() {
        const 账号 = this.账号输入框.value.trim();
        const 时长字符串 = this.时长输入框.value.trim();
        const 提醒字符串 = this.提醒输入框.value.trim();
        
        if (!账号 || !时长字符串) {
            this.显示错误('请输入账号和倒计时时间');
            return;
        }
        
        try {
            const 时长小时 = parseFloat(时长字符串);
            if (时长小时 <= 0) {
                throw new Error('无效的时间');
            }
            // 转换为分钟
            const 时长分钟 = Math.round(时长小时 * 60);
            
            // 处理提醒时间
            let 提醒时间 = null;
            if (提醒字符串) {
                const 提醒 = parseInt(提醒字符串);
                if (提醒 < 0 || 提醒 >= 时长分钟) {
                    this.显示错误('提醒时间必须小于倒计时时间');
                    return;
                }
                提醒时间 = 提醒;
            }
            
            // 计算开始时间和结束时间
            const 现在 = new Date();
            const 开始时间 = 现在.toISOString().replace('T', ' ').substring(0, 19);
            const 结束时间 = new Date(现在.getTime() + 时长分钟 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19);
            const 结束时间戳 = 现在.getTime() + 时长分钟 * 60 * 1000;
            
            // 创建计时器数据
            const 计时器数据 = {
                id: Date.now(),
                account: 账号,
                start_time: 开始时间,
                end_time: 结束时间,
                end_timestamp: 结束时间戳,
                remind_time: 提醒时间,
                reminded: false
            };
            
            // 添加到列表
            this.计时器列表.push(计时器数据);
            
            // 添加到表格
            this.添加计时器到表格(计时器数据);
            
            // 启动倒计时
            this.启动倒计时(计时器数据);
            
            // 保存数据
            this.保存数据();
            
            // 清空输入框
            this.账号输入框.value = '';
            this.时长输入框.value = '';
            this.提醒输入框.value = '';
        } catch (error) {
            this.显示错误('请输入有效的倒计时时间');
        }
    }
    
    添加计时器到表格(计时器数据) {
        const 行 = document.createElement('tr');
        行.id = `timer-${计时器数据.id}`;
        
        行.innerHTML = `
            <td><input type="checkbox" class="checkbox" data-id="${计时器数据.id}"></td>
            <td>${计时器数据.account}</td>
            <td>${计时器数据.start_time}</td>
            <td>${计时器数据.end_time}</td>
            <td class="countdown"></td>
        `;
        
        this.计时器表格.appendChild(行);
    }
    
    启动倒计时(计时器数据) {
        const 定时器 = setInterval(() => {
            const 现在 = Date.now();
            const 剩余时间 = 计时器数据.end_timestamp - 现在;
            
            const 行 = document.getElementById(`timer-${计时器数据.id}`);
            if (!行) {
                clearInterval(定时器);
                return;
            }
            
            const 倒计时单元格 = 行.querySelector('.countdown');
            
            if (剩余时间 <= 0) {
                // 计算超时时间
                const 超时时间 = Math.round(Math.abs(剩余时间) / (60 * 1000));
                倒计时单元格.textContent = `已超时 ${超时时间}分钟`;
                // 添加红色样式
                行.classList.add('expired');
            } else {
                // 计算剩余时间
                const 总秒数 = Math.floor(剩余时间 / 1000);
                const 小时 = Math.floor(总秒数 / 3600);
                const 分钟 = Math.floor((总秒数 % 3600) / 60);
                const 秒 = 总秒数 % 60;
                倒计时单元格.textContent = `${小时.toString().padStart(2, '0')}:${分钟.toString().padStart(2, '0')}:${秒.toString().padStart(2, '0')}`;
                
                // 检查是否需要提醒
                if (计时器数据.remind_time !== null && !计时器数据.reminded) {
                    const 剩余分钟 = Math.floor(剩余时间 / (60 * 1000));
                    if (剩余分钟 === 计时器数据.remind_time) {
                        this.显示提醒(计时器数据.account, 计时器数据.remind_time);
                        计时器数据.reminded = true;
                    }
                }
            }
        }, 1000);
        
        this.计时器定时器.push({ id: 计时器数据.id, interval: 定时器 });
    }
    
    删除选中() {
        const 选中的复选框 = document.querySelectorAll('.checkbox:checked');
        if (选中的复选框.length === 0) {
            this.显示错误('请选择要删除的计时器');
            return;
        }
        
        选中的复选框.forEach(复选框 => {
            const id = parseInt(复选框.dataset.id);
            
            // 找到对应的计时器数据
            const 索引 = this.计时器列表.findIndex(计时器 => 计时器.id === id);
            if (索引 !== -1) {
                this.计时器列表.splice(索引, 1);
            }
            
            // 清除对应的定时器
            const 定时器索引 = this.计时器定时器.findIndex(项目 => 项目.id === id);
            if (定时器索引 !== -1) {
                clearInterval(this.计时器定时器[定时器索引].interval);
                this.计时器定时器.splice(定时器索引, 1);
            }
            
            // 从表格中删除行
            const 行 = document.getElementById(`timer-${id}`);
            if (行) {
                行.remove();
            }
        });
        
        // 保存数据
        this.保存数据();
    }
    
    清空所有() {
        // 清除所有定时器
        this.计时器定时器.forEach(项目 => {
            clearInterval(项目.interval);
        });
        this.计时器定时器 = [];
        
        // 清空计时器数据
        this.计时器列表 = [];
        
        // 清空表格
        this.计时器表格.innerHTML = '';
        
        // 保存数据
        this.保存数据();
    }
    
    显示提醒(账号, 提醒时间) {
        this.提醒账号.textContent = `账号: ${账号}`;
        this.提醒消息.textContent = `倒计时还剩 ${提醒时间} 分钟！`;
        this.提醒模态框.style.display = 'block';
    }
    
    显示错误(消息) {
        this.错误消息.textContent = 消息;
        this.错误模态框.style.display = 'block';
    }
    
    保存数据() {
        localStorage.setItem('timersData', JSON.stringify(this.计时器列表));
    }
    
    加载数据() {
        const 保存的数据 = localStorage.getItem('timersData');
        if (保存的数据) {
            try {
                const 计时器列表 = JSON.parse(保存的数据);
                
                计时器列表.forEach(计时器数据 => {
                    // 检查数据是否有效
                    if (计时器数据.account && 计时器数据.end_timestamp) {
                        // 添加到列表
                        this.计时器列表.push(计时器数据);
                        
                        // 添加到表格
                        this.添加计时器到表格(计时器数据);
                        
                        // 启动倒计时
                        this.启动倒计时(计时器数据);
                    }
                });
            } catch (error) {
                console.error('加载数据失败:', error);
            }
        }
    }
}

// 初始化应用
window.onload = function() {
    new 计时器应用();
};