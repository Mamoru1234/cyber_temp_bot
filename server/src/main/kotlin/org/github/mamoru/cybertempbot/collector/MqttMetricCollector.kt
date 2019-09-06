package org.github.mamoru.cybertempbot.collector

import com.fasterxml.jackson.databind.ObjectMapper
import mu.KotlinLogging
import org.eclipse.paho.client.mqttv3.MqttClient
import org.eclipse.paho.client.mqttv3.MqttConnectOptions
import org.github.mamoru.cybertempbot.MetricAnalyzer
import org.github.mamoru.cybertempbot.entity.Sample
import org.springframework.stereotype.Service
import java.util.*
import javax.annotation.PostConstruct


@Service
class MqttMetricCollector(
        private val objectMapper: ObjectMapper,
        private val metricAnalyzer: MetricAnalyzer
) {
    private val publisherId = UUID.randomUUID().toString()
    private val logger = KotlinLogging.logger {}

    @PostConstruct
    fun init() {
        val client = MqttClient("tcp://10.2.15.117:2435", publisherId)
        val options = MqttConnectOptions()
        options.isAutomaticReconnect = true
        options.isCleanSession = true
        options.connectionTimeout = 10
        client.connect(options)
        client.subscribe("data") {
            topic, message ->
            logger.trace("Received message from topic: $topic")
            val dataEvent = objectMapper.readValue(message.payload, MqttCollectorDataEvent::class.java)
            logger.trace(dataEvent.toString())
            val sample = Sample(
                    deviceId = dataEvent.mac,
                    temp = dataEvent.temperature,
                    humidity = dataEvent.humidity
            )
            metricAnalyzer.handlerSample(sample)
        }
    }
}
