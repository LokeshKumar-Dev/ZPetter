function getNameFromCache(segment, name = 'UserId') {
    let cachePromise = segment.get(name);
    return cachePromise.then((entity) => {
        segment.update(name, entity.cache_value);
        return {'chk':true, value: entity.cache_value};
    }).catch((err) => {
        console.log('Error Putting Cache ' + err)
        return {'chk':false, value: err};
    });
}

function putUserIDOnCache(segment, uId) {
    let cachePromise = segment.put(`UserId`, uId);
    return cachePromise.then((entity) => {
        console.log(entity)
        return {'chk':true, value: entity.cache_value};
    }
    ).catch((err) => {
        console.log('Error Putting Cache ' + err)
        return false;
    });
}

module.exports = {getNameFromCache, putUserIDOnCache};