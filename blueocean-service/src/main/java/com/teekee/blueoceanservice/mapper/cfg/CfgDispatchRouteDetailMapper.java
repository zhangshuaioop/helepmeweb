package com.teekee.blueoceanservice.mapper.cfg;

import com.teekee.commoncomponets.base.BaseMapper;
import com.teekee.blueoceanservice.entity.cfg.CfgDispatchRouteDetail;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface CfgDispatchRouteDetailMapper extends BaseMapper<CfgDispatchRouteDetail> {


    /**
     * 根据routeId删除
     * @param routeId
     * @return
     */
    int deleteByRoute(Integer routeId);


    /**
     * 项目细则配置列表
     * @param routeId
     * @return
     */
    List<CfgDispatchRouteDetail> selectTree(Integer routeId);


    /**
     * 批量保存
     * @param record
     * @return
     */
    int insertBatch(List<CfgDispatchRouteDetail> record);


    /**
     * 批量更新
     * @param record
     * @return
     */
    int updateBatch(List<CfgDispatchRouteDetail> record);
}