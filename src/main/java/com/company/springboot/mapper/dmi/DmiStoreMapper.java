package com.company.springboot.mapper.dmi;

import com.company.springboot.base.BaseMapper;
import com.company.springboot.entity.dmi.DmiStore;
import com.company.springboot.entity.dmi.DmiStoreBySelectByAreaSort;
import com.company.springboot.entity.dmi.DmiStoreWithBusinessLicense;
import com.company.springboot.entity.dmi.ret.dmiStore.ListRet;
import com.github.pagehelper.Page;
import com.company.springboot.base.BaseMapper;
import com.company.springboot.entity.bif.BifMd5CodePool;
import com.company.springboot.entity.dmi.DmiStore;
import com.company.springboot.entity.dmi.DmiStoreBySelectByAreaSort;
import com.company.springboot.entity.dmi.DmiStoreWithBusinessLicense;
import com.company.springboot.entity.dmi.ret.dmiStore.ListRet;
import org.apache.ibatis.annotations.Mapper;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Mapper
public interface DmiStoreMapper extends BaseMapper<DmiStore> {

    int insertSelective(DmiStore record);

    DmiStore selectByPrimaryKey(Integer id);

    int selectByBusinessLicenseId(Integer id);

    int getCountByBrandId(Integer id);

    List<DmiStore> selectStoreByTripleId(HashMap<String, Object> map);

    int updateByPrimaryKeySelective(DmiStore record);

    DmiStoreWithBusinessLicense selectWithBizLicByPrimaryKey(Integer id);

    List<DmiStore> getListByAddressId(Integer addressId);

    List<DmiStore> listByBuildingId(Integer addressId);

    List<ListRet> queryListByObject(DmiStore record);

    List<DmiStoreBySelectByAreaSort> selectByAreaIdSort(Integer companyId);

    List<DmiStore> selectByAreaId(Integer areaId);

    /**
     * 查询门店ID根据excel门店名
     *
     * @param
     * @author liukan
     * @create 2018年04月25日 10:39
     * @return
     */
    int selectByStoreName(String value);
    /**
     * 查询雇主 ID根据excel雇主名
     *
     * @param
     * @author liukan
     * @create 2018年04月25日 10:39
     * @return
     */
    int selectByStoreId(int storeId);


    List<Integer> selectChildrenId(int areaId);

    List<ListRet> queryListByObjectList(List<Integer> list, DmiStore record);

    List<ListRet> queryStoreList(Map map);

    Page<DmiStore> queryStoreByCompanyId(Integer companyId);

    List<String> selectByStoreNameByCompanyId(Integer companyId);

    Integer setStoreId(String storeName);

    void updateStoreUrl(DmiStore dmiStore);

    void updateStoreToken(BifMd5CodePool pool);

    List<DmiStore> selectAll();
    /**
     * 根据雇主公司的ID,获取门店list
     * @param store
     * @return
     * @author Niting
     * @Date 2018/07/02
     */
    Page<ListRet> selectStoreList(DmiStore store);

    List<DmiStore> selectNoQrCodeStore();
}