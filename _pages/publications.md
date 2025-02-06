---
layout: archive
title: "Selected Publications"
permalink: /publications/
author_profile: true
---

You can find all of my articles on <a href="https://scholar.google.com/citations?user=vu1pDZgAAAAJ" target="_blank">my Google Scholar profile</a>.

(* = equal contribution)

{% include base_path %}

---

## 🔍 Retrieval Augmentation and Beyond

{% assign publicationsByYear = site.publications | group_by_exp:"post", "post.date | date: '%Y'" %}
{% for year in publicationsByYear reversed %}
<!--   <h1 style="margin: 1.5em 0px -0.5em; padding: 0px; color: brown;">{{ year.name }}</h1> -->
  {% assign publicationsByMonth = year.items | group_by_exp:"post", "post.date | date: '%B'" %}
  {% for month in publicationsByMonth reversed %}
    {% for post in month.items reversed %}
      {% if post.selected == "true" %}
        {% if post.topic == "rag" %}
          {% include archive-single.html %}
        {% endif %}
      {% endif %}
    {% endfor %}
  {% endfor %}
{% endfor %}

## 📌 Keyphrase Generation and Extraction

{% assign publicationsByYear = site.publications | group_by_exp:"post", "post.date | date: '%Y'" %}
{% for year in publicationsByYear reversed %}
<!--   <h1 style="margin: 1.5em 0px -0.5em; padding: 0px; color: brown;">{{ year.name }}</h1> -->
  {% assign publicationsByMonth = year.items | group_by_exp:"post", "post.date | date: '%B'" %}
  {% for month in publicationsByMonth reversed %}
    {% for post in month.items reversed %}
      {% if post.selected == "true" %}
        {% if post.topic == "keyphrase" %}
          {% include archive-single.html %}
        {% endif %}
      {% endif %}
    {% endfor %}
  {% endfor %}
{% endfor %}

## 🔬 Virtual Histology

{% assign publicationsByYear = site.publications | group_by_exp:"post", "post.date | date: '%Y'" %}
{% for year in publicationsByYear reversed %}
<!--   <h1 style="margin: 1.5em 0px -0.5em; padding: 0px; color: brown;">{{ year.name }}</h1> -->
  {% assign publicationsByMonth = year.items | group_by_exp:"post", "post.date | date: '%B'" %}
  {% for month in publicationsByMonth reversed %}
    {% for post in month.items reversed %}
      {% if post.selected == "true" %}
        {% if post.topic == "staining" %}
          {% include archive-single.html %}
        {% endif %}
      {% endif %}
    {% endfor %}
  {% endfor %}
{% endfor %}


<!-- <h1 style="margin: 1.25em 0px -0.5em; padding: 0px; color: brown;">Theses</h1>
{% for post in site.publications reversed %}
  {% if post.venue == "UCLA Electronic Theses and Dissertations" %}
    {% include archive-single.html %}
  {% endif %}
{% endfor %} -->
