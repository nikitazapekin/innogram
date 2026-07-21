resource "random_password" "postgres" {
  count   = var.create_vm ? 1 : 0
  length  = 16
  special = false
}

resource "random_password" "minio" {
  count   = var.create_vm ? 1 : 0
  length  = 16
  special = false
}

resource "yandex_compute_instance" "app" {
  count = var.create_vm ? 1 : 0

  name        = var.vm_name
  platform_id = "standard-v3"
  zone        = var.zone
  labels      = local.labels

  resources {
    cores         = var.vm_cores
    memory        = var.vm_memory_gb
    core_fraction = var.vm_core_fraction
  }

  boot_disk {
    initialize_params {
      image_id = data.yandex_compute_image.ubuntu.id
      size     = var.vm_disk_gb
      type     = "network-hdd"
    }
  }

  network_interface {
    subnet_id          = local.subnet_id
    nat                = true
    security_group_ids = [yandex_vpc_security_group.app[0].id]
  }

  scheduling_policy {
    preemptible = var.vm_preemptible
  }

  metadata = {
    ssh-keys  = "${var.ssh_username}:${local.ssh_public_key}"
    user-data = templatefile("${path.module}/templates/cloud-init.yaml.tftpl", {
      ssh_username      = var.ssh_username
      ssh_public_key    = local.ssh_public_key
      postgres_password = random_password.postgres[0].result
      minio_password    = random_password.minio[0].result
    })
  }

  timeouts {
    create = "15m"
    delete = "10m"
  }
}
