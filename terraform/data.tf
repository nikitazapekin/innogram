 

data "yandex_resourcemanager_folder" "current" {
  folder_id = var.folder_id
}
 
data "yandex_compute_image" "ubuntu" {
  family = "ubuntu-2204-lts"
}

 
data "yandex_vpc_network" "existing" {
  count = var.reuse_network ? 1 : 0
  name  = var.existing_network_name
}

data "yandex_vpc_subnet" "existing" {
  count = var.reuse_network ? 1 : 0
  name  = var.existing_subnet_name
}
