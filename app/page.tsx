import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line } from 'recharts';

const DiningAnalysisSystem = () => {
  // 状态管理
  const [rawData, setRawData] = useState('');
  const [selectedPerson, setSelectedPerson] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // 数据处理函数
  const processData = (text) => {
    const lines = text.trim().split(/[\n\r]+/);
    return lines.map(line => {
      const parts = line.split(/\s+/);
      return {
        name: parts[0],
        date: parts[1] || '',
        type: parts[2] || '',
        timestamp: parts[3] || ''
      };
    });
  };

  // 处理后的数据
  const processedData = useMemo(() => {
    return processData(rawData);
  }, [rawData]);

  // 获取所有人员列表
  const people = useMemo(() => {
    const uniquePeople = new Set(processedData.map(record => record.name));
    return ['all', ...Array.from(uniquePeople)];
  }, [processedData]);

  // 获取所有月份列表
  const months = useMemo(() => {
    const uniqueMonths = new Set(processedData.map(record => record.date.substring(0, 7)));
    return ['all', ...Array.from(uniqueMonths).sort()];
  }, [processedData]);

  // 过滤数据
  const filteredData = useMemo(() => {
    return processedData.filter(record => {
      const personMatch = selectedPerson === 'all' || record.name === selectedPerson;
      const monthMatch = selectedMonth === 'all' || record.date.startsWith(selectedMonth);
      const dateRangeMatch = (!dateRange.start || record.date >= dateRange.start) &&
                            (!dateRange.end || record.date <= dateRange.end);
      return personMatch && monthMatch && dateRangeMatch;
    });
  }, [processedData, selectedPerson, selectedMonth, dateRange]);

  // 统计数据
  const stats = useMemo(() => {
    const dailyStats = {};
    const monthlyStats = {};
    const personStats = {};

    filteredData.forEach(record => {
      // 日期统计
      if (!dailyStats[record.date]) {
        dailyStats[record.date] = { count: 0, types: new Set() };
      }
      dailyStats[record.date].count++;
      dailyStats[record.date].types.add(record.type);

      // 月度统计
      const month = record.date.substring(0, 7);
      if (!monthlyStats[month]) {
        monthlyStats[month] = { count: 0, days: new Set() };
      }
      monthlyStats[month].count++;
      monthlyStats[month].days.add(record.date);

      // 人员统计
      if (!personStats[record.name]) {
        personStats[record.name] = { count: 0, days: new Set() };
      }
      personStats[record.name].count++;
      personStats[record.name].days.add(record.date);
    });

    return {
      totalRecords: filteredData.length,
      uniqueDays: Object.keys(dailyStats).length,
      monthlyData: Object.entries(monthlyStats).map(([month, data]) => ({
        month,
        records: data.count,
        days: data.days.size
      })).sort((a, b) => a.month.localeCompare(b.month)),
      duplicates: Object.values(dailyStats).filter(day => day.count > 1).length
    };
  }, [filteredData]);

  // 处理文件上传
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setRawData(e.target.result);
      reader.readAsText(file);
    }
  };

  // 导出分析结果
  const exportResults = () => {
    const csvContent = [
      ['日期', '姓名', '类型', '次数'].join(','),
      ...filteredData.map(record => 
        [record.date, record.name, record.type].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `用餐分析_${selectedPerson}_${selectedMonth}.csv`;
    link.click();
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>用餐记录分析系统</span>
            <div className="space-x-2">
              <input
                type="file"
                accept=".txt,.csv"
                onChange={handleFileUpload}
                className="hidden"
                id="fileInput"
              />
              <label
                htmlFor="fileInput"
                className="px-4 py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600"
              >
                导入数据
              </label>
              <button
                onClick={exportResults}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                导出分析
              </button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* 筛选器 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <select
              value={selectedPerson}
              onChange={(e) => setSelectedPerson(e.target.value)}
              className="p-2 border rounded"
            >
              {people.map(person => (
                <option key={person} value={person}>
                  {person === 'all' ? '所有人员' : person}
                </option>
              ))}
            </select>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="p-2 border rounded"
            >
              {months.map(month => (
                <option key={month} value={month}>
                  {month === 'all' ? '所有月份' : month}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="p-2 border rounded"
            />
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="p-2 border rounded"
            />
          </div>

          {/* 统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded">
              <div className="text-2xl font-bold text-blue-600">{stats.totalRecords}</div>
              <div className="text-sm text-gray-600">总记录数</div>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <div className="text-2xl font-bold text-green-600">{stats.uniqueDays}</div>
              <div className="text-sm text-gray-600">用餐天数</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded">
              <div className="text-2xl font-bold text-yellow-600">{stats.duplicates}</div>
              <div className="text-sm text-gray-600">重复记录天数</div>
            </div>
            <div className="bg-purple-50 p-4 rounded">
              <div className="text-2xl font-bold text-purple-600">
                {(stats.totalRecords / Math.max(stats.uniqueDays, 1)).toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">平均每天记录数</div>
            </div>
          </div>

          {/* 趋势图表 */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">月度趋势</h3>
            <LineChart width={800} height={300} data={stats.monthlyData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="records" name="记录数" stroke="#8884d8" />
              <Line type="monotone" dataKey="days" name="天数" stroke="#82ca9d" />
            </LineChart>
          </div>

          {/* 数据表格 */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">详细记录</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-2 text-left">日期</th>
                    <th className="p-2 text-left">姓名</th>
                    <th className="p-2 text-left">类型</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.slice(0, 100).map((record, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">{record.date}</td>
                      <td className="p-2">{record.name}</td>
                      <td className="p-2">{record.type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredData.length > 100 && (
                <div className="text-center text-gray-500 mt-2">
                  显示前100条记录，共 {filteredData.length} 条
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DiningAnalysisSystem;
