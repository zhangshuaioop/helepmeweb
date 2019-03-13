package com.company.springboot.mapper.bif;

import com.github.pagehelper.Page;
import com.company.springboot.base.BaseMapper;
import com.company.springboot.entity.bif.BifDeviceSeries;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface BifDeviceSeriesMapper extends BaseMapper<BifDeviceSeries> {
    int insertSelective(BifDeviceSeries record);

    BifDeviceSeries selectByPrimaryKey(Integer id);

    Page<BifDeviceSeries> selectList(Integer modelId);

    int updateByPrimaryKeySelective(BifDeviceSeries record);
}