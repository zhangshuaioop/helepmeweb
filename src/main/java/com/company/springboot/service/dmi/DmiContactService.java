package com.company.springboot.service.dmi;

import com.alibaba.fastjson.JSON;
import com.company.springboot.base.BaseService;
import com.company.springboot.entity.dmi.DmiContact;
import com.company.springboot.mapper.dmi.DmiContactCompanyRelationMapper;
import com.company.springboot.mapper.dmi.DmiContactMapper;
import com.company.springboot.mapper.dmi.DmiContactStoreRelationMapper;
import com.company.springboot.utils.*;
import com.github.pagehelper.Page;
import com.github.pagehelper.PageHelper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
import java.util.Date;
import java.util.List;

/**
 * @Author Niting
 * @date 2018/12/15
 **/
@Service
public class DmiContactService extends BaseService<DmiContactMapper, DmiContact> {
    @Autowired
    private DmiContactMapper mapper;

    @Resource
    private DmiContactStoreRelationMapper dmiContactStoreRelationMapper;

    @Resource
    private DmiContactCompanyRelationMapper dmiContactCompanyRelationMapper;

    /**
     * 根据雇主公司的ID，获取公司所有联系人列表
     *
     * @param:
     * @return:
     * @Author Niting
     * @date: 2018/12/17
     */
    public Result getListByCompanyId(DmiContact dmiContact, int userId) {

        PageHelper.startPage(dmiContact.getPageNum(), dmiContact.getPageSize());
        Page<DmiContact> persons = mapper.selectListByCompanyId(dmiContact);
        // 需要把Page包装成PageInfo对象才能序列化。该插件也默认实现了一个PageInfo
        PageInfo<DmiContact> pageInfo = new PageInfo<>(persons);
        if(pageInfo.getList()==null||pageInfo.getList().size()==0){
            pageInfo.setPageNum(1);
            pageInfo.setPageSize(10);
        }
        return ResultUtil.success(pageInfo);

    }

    /**
     * 根据门店的ID，获取门店所有联系人列表
     *
     * @param:
     * @return:
     * @Author Niting
     * @date: 2018/12/17
     */
    public Result getListByStoreId(DmiContact contact, Integer id) {
        PageHelper.startPage(contact.getPageNum(), contact.getPageSize());
        Page<DmiContact> persons = mapper.selectListByStoreId(contact);
        // 需要把Page包装成PageInfo对象才能序列化。该插件也默认实现了一个PageInfo
        PageInfo<DmiContact> pageInfo = new PageInfo<>(persons);
        if(pageInfo.getList()==null||pageInfo.getList().size()==0){
            pageInfo.setPageNum(1);
            pageInfo.setPageSize(10);
        }
        return ResultUtil.success(pageInfo);
    }

    /**
     * 雇主新增/编辑联系人
     *
     * @param:
     * @return:
     * @Author Niting
     * @date: 2018/12/17
     */
    @Transactional
    public Result companyHandle(DmiContact dmiContact, Integer userId) {
        if (dmiContact.getContactName() == null || dmiContact.getContactName().length() == 0) {
            return ResultUtil.errorExceptionMsg("姓名不能为空");
        }
        if (dmiContact.getAccount() == null || dmiContact.getAccount().length() == 0) {
            return ResultUtil.errorExceptionMsg("账号不能为空");
        }
        if (dmiContact.getMobile() == null || dmiContact.getMobile().length() == 0) {
            return ResultUtil.errorExceptionMsg("手机号不能为空");
        }
        if (dmiContact.getMobile().length() > 11) {
            return ResultUtil.errorExceptionMsg("手机号码不得大于11位");
        }
        if (!ValiDateUtil.isNumeric(dmiContact.getMobile())) {
            return ResultUtil.errorExceptionMsg("手机号码必须是纯数字");
        }


        if (!ValiDateUtil.isAllHalf(dmiContact.getAccount())) {
            return ResultUtil.errorExceptionMsg("账号必须半角");
        }

        if (dmiContact.getId() > 0) {

            dmiContact.setUpdatePerson(userId);
            dmiContact.setUpdateTime(new Date());
            //编辑联系人门店关系
            if (dmiContact.getFlagMajor()) {
                DmiContact contact = new DmiContact();
                contact.setId(dmiContact.getId());
                contact.setFlagMajor(false);
                if (dmiContact.getStoreId() != null && !dmiContact.getStoreId().equals("0")) {
                    contact.setStoreId(dmiContact.getStoreId());
                    mapper.updateNotFlagMajorContactById(contact);
                } else if (dmiContact.getBelongCompanyId() != null && !dmiContact.getBelongCompanyId().equals("0")) {
                    contact.setBelongCompanyId(dmiContact.getBelongCompanyId());
                    mapper.updateNotFlagMajorContactById(contact);
                }
            }
            return updateContactCheck(dmiContact);
        } else {

            if (!ValiDateUtil.isAllHalf(dmiContact.getPassword())) {
                return ResultUtil.errorExceptionMsg("密码必须半角");
            }

            if (dmiContact.getPassword() == null || dmiContact.getPassword().length() == 0) {
                return ResultUtil.errorExceptionMsg("密码不能为空");
            }
            dmiContact.setCreatePerson(userId);
            dmiContact.setCreateTime(new Date());
            dmiContact.setFlagAvailable(true);
            dmiContact.setFlagDeleted(false);
            dmiContact.setUpdatePerson(userId);
            dmiContact.setUpdateTime(new Date());
            dmiContact.setPassword(Encrypt.getMD5Str(dmiContact.getPassword()));
            dmiContact.setAccount(dmiContact.getAccount());
            dmiContact.setSourceType("FAULT");
            //查询联系人手机号是否存在 如果不存在执行insert 如果存在修改联系人姓名

            List<DmiContact> list = mapper.selectByMobile(dmiContact.getMobile());
            List<DmiContact> accountList = mapper.selectAccount(dmiContact.getAccount());
            //判定账号是否重复
            if (accountList.size() == 0) {
                //判定手机号是否重复
                if (list.size() > 0) {
                    return ResultUtil.errorExceptionMsg("此手机号已绑定用户");
                } else {
                    if (insertContact(dmiContact)) {
                        //编辑联系人门店关系
                        if (dmiContact.getFlagMajor()) {
                            DmiContact contact = new DmiContact();
                            contact.setId(dmiContact.getId());
                            contact.setFlagMajor(false);
                            if (dmiContact.getStoreId() != null && !dmiContact.getStoreId().equals("0")) {
                                contact.setStoreId(dmiContact.getStoreId());
                                mapper.updateNotFlagMajorContactById(contact);
                            } else if (dmiContact.getBelongCompanyId() != null && !dmiContact.getBelongCompanyId().equals("0")) {
                                contact.setBelongCompanyId(dmiContact.getBelongCompanyId());
                                mapper.updateNotFlagMajorContactById(contact);
                            }
                        }

                        return ResultUtil.successMsg("新增联系人成功!");
                    }
                    return ResultUtil.errorExceptionMsg("新增联系人失败!");
                }

            } else {
                return ResultUtil.errorExceptionMsg("账号已存在,请更换账号");
            }
        }
    }

    /**
     * @param: 根据ID，查看联系人详情
     * @return:
     * @Author Niting
     * @date: 2018/12/17
     */
    public Result getContact(int id) {
        DmiContact sqlResult = mapper.selectByPrimaryKey(id);
        return ResultUtil.success(sqlResult == null ? new DmiContact() : sqlResult);
    }

    /**
     * 失效联系人
     *
     * @param:
     * @return:
     * @Author Niting
     * @date: 2018/12/15
     */
    public Result handleInvalid(int userId, String requestJson) {
        DmiContact dmiContact = JSON.parseObject(requestJson, DmiContact.class);

        // 设定失效
        dmiContact.setFlagAvailable(false);
        dmiContact.setUpdateTime(new Date());
        dmiContact.setUpdatePerson(userId);

        if (updateContact(dmiContact)) {
            return ResultUtil.successMsg("联系人失效成功！");
        }
        return ResultUtil.errorExceptionMsg("联系人失效失败！");
    }

    /**
     * 删除联系人
     *
     * @param:
     * @return:
     * @Author Niting
     * @date: 2018/12/15
     */
    public Result handleDelete(int userId, String requestJson) {
        DmiContact dmiContact = JSON.parseObject(requestJson, DmiContact.class);

        // 设定失效
        dmiContact.setFlagDeleted(true);
        dmiContact.setUpdateTime(new Date());
        dmiContact.setUpdatePerson(userId);

        if (updateContact(dmiContact)) {
            return ResultUtil.successMsg("删除联系人成功！");
        }
        return ResultUtil.errorExceptionMsg("删除联系人失败！");
    }

    /**
     * 重置联系人密码
     *
     * @param id
     * @return
     */
    public Result resetPassword(Integer id) {

        DmiContact contact = new DmiContact();
        //先查询输入的旧密码是否正确
        String newPassWord = Encrypt.getMD5Str("123456");
        contact.setPassword(newPassWord);
        contact.setUpdatePerson(CurrentUtil.getCurrent().getId());
        contact.setUpdateTime(new Date());
        contact.setId(id);
        if (updateContact(contact)) {
            return ResultUtil.successMsg("重置密码修改成功！");
        }
        return ResultUtil.errorExceptionMsg("重置密码修改失败！");
    }

    /**
     * 更新联系人
     *
     * @param dmiContact
     * @return
     * @Author:Niting
     * @Date:2018/12/15
     */
    private boolean updateContact(DmiContact dmiContact) {
        int effectRows = mapper.updateByPrimaryKeySelective(dmiContact);

        if (effectRows > 0) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * 更新联系人信息验证
     *
     * @param:
     * @return:
     * @Author Niting
     * @date: 2018/12/17
     */
    private Result updateContactCheck(DmiContact dmiContact) {
        List<DmiContact> list = mapper.selectByMobile(dmiContact.getMobile());
        List<DmiContact> accountList = mapper.selectAccount(dmiContact.getAccount());

        if (list.size() == 0 && accountList.size() == 0) {

            mapper.updateByPrimaryKeySelectiveCheck(dmiContact);
            return ResultUtil.successMsg("更新成功！");

        } else {
            if (list.size() > 1) {
                return ResultUtil.errorExceptionMsg("此手机号已绑定用户");
            }
            if (accountList.size() > 1) {
                return ResultUtil.errorExceptionMsg("账号已存在,请更换账号");
            }

            if (list.size() == 1 && !list.get(0).getId().equals(dmiContact.getId()) ) {
                return ResultUtil.errorExceptionMsg("此手机号已绑定用户");
            }
            if (accountList.size() == 1 && !accountList.get(0).getId().equals(dmiContact.getId())) {
                return ResultUtil.errorExceptionMsg("账号已存在,请更换账号");
            }

            mapper.updateByPrimaryKeySelectiveCheck(dmiContact);
            return ResultUtil.successMsg("更新成功！");
        }
    }

    /**
     * 新增联系人
     *
     * @param:
     * @return:
     * @Author Niting
     * @date: 2018/12/17
     */
    private boolean insertContact(DmiContact dmiContact) {
        int effectRows = mapper.insertSelective(dmiContact);

        if (effectRows > 0) {
            return true;
        } else {
            return false;
        }
    }

}