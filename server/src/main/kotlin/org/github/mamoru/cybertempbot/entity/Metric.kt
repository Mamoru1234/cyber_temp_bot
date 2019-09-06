package org.github.mamoru.cybertempbot.entity

data class Metric(
        val timestamp: Number,
        val deviceId: String,
        val temp: Number,
        val humidity: Number
)
