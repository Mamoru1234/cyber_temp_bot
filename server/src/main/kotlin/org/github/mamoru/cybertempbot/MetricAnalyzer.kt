package org.github.mamoru.cybertempbot

import org.github.mamoru.cybertempbot.entity.Metric
import org.github.mamoru.cybertempbot.entity.Sample
import org.springframework.stereotype.Service
import java.util.concurrent.atomic.AtomicReference

@Service
class MetricAnalyzer {
    private val lastMetric = AtomicReference<Metric?>(null)

    fun getLastMetric(): Metric? = lastMetric.get()

    fun handlerSample(sample: Sample) {
        val metric = Metric(
                timestamp = System.currentTimeMillis(),
                deviceId = sample.deviceId,
                temp = sample.temp,
                humidity = sample.humidity
        )
        lastMetric.set(metric)
    }
}
