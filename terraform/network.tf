 
resource "yandex_vpc_network" "this" {
  count       = var.reuse_network ? 0 : 1
  name        = "${var.project_name}-net"
  description = "Network for Innogram (created by Terraform)"
  labels      = local.labels
}

resource "yandex_vpc_subnet" "this" {
  count          = var.reuse_network ? 0 : 1
  name           = "${var.project_name}-subnet"
  zone           = var.zone
  network_id     = yandex_vpc_network.this[0].id
  v4_cidr_blocks = [var.subnet_cidr]
  labels         = local.labels
}

resource "yandex_vpc_security_group" "app" {
  count       = var.create_vm ? 1 : 0
  name        = "${var.project_name}-app-sg"
  description = "Innogram app VM security group"
  network_id  = local.network_id
  labels      = local.labels

  egress {
    protocol       = "ANY"
    description    = "All outbound"
    v4_cidr_blocks = ["0.0.0.0/0"]
    from_port      = 0
    to_port        = 65535
  }

  dynamic "ingress" {
    for_each = var.open_ports
    content {
      protocol       = "TCP"
      description    = "Port ${ingress.value}"
      v4_cidr_blocks = ["0.0.0.0/0"]
      port           = ingress.value
    }
  }

  ingress {
    protocol       = "ICMP"
    description    = "ICMP"
    v4_cidr_blocks = ["0.0.0.0/0"]
  }
}
