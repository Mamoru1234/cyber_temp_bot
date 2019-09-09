package org.github.mamoru.cybertempbot.collector

import com.fasterxml.jackson.databind.ObjectMapper
import mu.KotlinLogging
import org.eclipse.paho.client.mqttv3.MqttClient
import org.eclipse.paho.client.mqttv3.MqttConnectOptions
import org.github.mamoru.cybertempbot.MetricAnalyzer
import org.github.mamoru.cybertempbot.config.CyberTempBotProps
import org.github.mamoru.cybertempbot.entity.Sample
import org.springframework.stereotype.Service
import java.io.IOException
import java.util.*
import javax.annotation.PostConstruct


@Service
class MqttMetricCollector(
        private val cyberTempBotProps: CyberTempBotProps,
        private val objectMapper: ObjectMapper,
        private val metricAnalyzer: MetricAnalyzer
) {
    private val publisherId = UUID.randomUUID().toString()
    private val logger = KotlinLogging.logger {}

    @PostConstruct
    fun init() {
        val client = MqttClient(cyberTempBotProps.mqttUrl, publisherId)
        val options = MqttConnectOptions()
        options.isAutomaticReconnect = true
        options.isCleanSession = true
        options.connectionTimeout = 10
        client.connect(options)
        client.subscribe(cyberTempBotProps.dataTopic) {
            _, message ->
            try {

                val dataEvent = objectMapper.readValue(message.payload, MqttCollectorDataEvent::class.java)
                val sample = Sample(
                        deviceId = dataEvent.mac,
                        temp = dataEvent.temperature,
                        humidity = dataEvent.humidity
                )
                metricAnalyzer.handlerSample(sample)
            } catch (e: IOException) {
                logger.info("Mqtt message parsing error error ${String(message.payload)}")
            }
        }
    }
}
