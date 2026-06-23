/*
赵云与阿斗-小游戏
免广告领奖励
*/

try {
    let obj = JSON.parse($response.body);

    if (obj && obj.data) {
        obj.data.userType = 1;
    }

    $done({
        body: JSON.stringify(obj)
    });
} catch (e) {
    console.log("zyyad error: " + e);
    $done({});
}
