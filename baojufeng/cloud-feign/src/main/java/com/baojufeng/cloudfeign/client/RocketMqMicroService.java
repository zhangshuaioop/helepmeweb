package com.baojufeng.cloudfeign.client;

import com.baojufeng.cloudfeign.hystrix.HystrixClientFallback;
import com.baojufeng.commoncomponets.utils.Result;
import org.springframework.cloud.netflix.feign.FeignClient;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * RocketMq服务
 */
@FeignClient(name = "service-public",fallback = HystrixClientFallback.class)
public interface RocketMqMicroService {
    /**
     * 消息发送者
     * @return
     */
    @RequestMapping("/rocketMq/producer")
    Result producer();




}
