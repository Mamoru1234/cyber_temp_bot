package org.github.mamoru.cybertempbot.ext

import org.github.mamoru.cybertempbot.entity.Metric

class MetricQueue(private val window: Long) {
    private var metrics = emptyList<Metric>()

    @Synchronized
    fun addMetric(metric: Metric) {
        metrics = metrics + metric
        val now = System.currentTimeMillis()
        metrics.dropWhile { (now - it.timestamp.toLong()) > window }
    }
}
